from server.quiz_projection import public_quiz
from flask import Blueprint, request, jsonify
import openai
import os
import json
import traceback
from middleware.request_user import require_user
from middleware.supabase_admin import get_supabase_admin
from middleware.openai_client import client as openai_client

quizzes_bp = Blueprint('quizzes', __name__)
supabase = get_supabase_admin()

@quizzes_bp.route('/api/quizzes/generate', methods=['POST'])
@require_user
def generate_quiz(user_id):
    """
    Generate a quiz for a course module using AI
    """
    if not openai_client:
        return jsonify({'error': 'AI service not available'}), 503
    
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        module_id = data.get('module_id')
        module_title = data.get('module_title', '')
        module_description = data.get('module_description', '')
        
        if not course_id or not module_id:
            return jsonify({'error': 'course_id and module_id are required'}), 400
        
        existing_quiz = supabase.table('course_quizzes')\
            .select('*')\
            .eq('course_id', course_id)\
            .eq('module_id', module_id)\
            .execute()
        
        if existing_quiz.data:
            return jsonify({
                'quiz': public_quiz(existing_quiz.data[0]),
                'message': 'Quiz already exists'
            })
        
        quiz_prompt = f"""Generate a 5-question multiple-choice quiz for this marketing course module:

Module: {module_title}
Description: {module_description}

Requirements:
1. Create 5 multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Mark the correct answer
4. Include brief explanations for why each answer is correct/incorrect
5. Questions should test practical understanding, not just memorization
6. Focus on actionable marketing concepts

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": [
        {{"id": "A", "text": "First option"}},
        {{"id": "B", "text": "Second option"}},
        {{"id": "C", "text": "Third option"}},
        {{"id": "D", "text": "Fourth option"}}
      ],
      "correctAnswer": "A",
      "explanation": "Explanation of why A is correct and others are not"
    }}
  ]
}}"""
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert marketing educator. Generate high-quality quiz questions that test practical understanding. Always return valid JSON only, no additional text."
                },
                {
                    "role": "user",
                    "content": quiz_prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        ai_response = ai_response.replace('```json', '').replace('```', '').strip()
        
        try:
            quiz_data = json.loads(ai_response)
        except json.JSONDecodeError as e:
            print(f"Failed to parse AI response: {ai_response}")
            raise Exception(f"Invalid JSON response from AI: {str(e)}")
        
        quiz_record = {
            'course_id': course_id,
            'module_id': module_id,
            'title': f"{module_title} - Knowledge Check",
            'description': f"Test your understanding of {module_title}",
            'questions': quiz_data,
            'passing_score': 70,
            'time_limit_minutes': 10
        }
        
        db_response = supabase.table('course_quizzes')\
            .insert(quiz_record)\
            .execute()
        
        return jsonify({
            'quiz': public_quiz(db_response.data[0]) if db_response.data else None,
            'message': 'Quiz generated successfully'
        }), 201
    
    except Exception as e:
        print(f"Error generating quiz: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': 'Failed to generate quiz',
            'details': str(e)
        }), 500

@quizzes_bp.route('/api/quizzes/<course_id>/<module_id>', methods=['GET'])
@require_user
def get_quiz(user_id, course_id, module_id):
    """Get quiz for a specific course module"""
    try:
        response = supabase.table('course_quizzes')\
            .select('*')\
            .eq('course_id', course_id)\
            .eq('module_id', module_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Quiz not found'}), 404
        
        quiz = response.data[0]
        
        user_attempts = supabase.table('user_quiz_responses')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('quiz_id', quiz['id'])\
            .order('created_at', desc=True)\
            .execute()
        
        return jsonify({
            'quiz': public_quiz(quiz),
            'previousAttempts': user_attempts.data if user_attempts.data else []
        })
    
    except Exception as e:
        print(f"Error fetching quiz: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch quiz'}), 500

@quizzes_bp.route('/api/quizzes/submit', methods=['POST'])
@require_user
def submit_quiz(user_id):
    """Submit and grade a quiz attempt"""
    try:
        data = request.get_json()
        quiz_id = data.get('quiz_id')
        answers = data.get('answers', {})
        time_taken_seconds = data.get('time_taken_seconds', 0)
        
        if not quiz_id or not answers:
            return jsonify({'error': 'quiz_id and answers are required'}), 400
        
        quiz_response = supabase.table('course_quizzes')\
            .select('*')\
            .eq('id', quiz_id)\
            .execute()
        
        if not quiz_response.data:
            return jsonify({'error': 'Quiz not found'}), 404
        
        quiz = quiz_response.data[0]
        questions = quiz['questions']['questions']
        
        correct_count = 0
        feedback = []
        
        for question in questions:
            q_id = str(question['id'])
            user_answer = answers.get(q_id)
            correct_answer = question['correctAnswer']
            is_correct = user_answer == correct_answer
            
            if is_correct:
                correct_count += 1
            
            feedback.append({
                'questionId': q_id,
                'userAnswer': user_answer,
                'correctAnswer': correct_answer,
                'isCorrect': is_correct,
                'explanation': question.get('explanation', '')
            })
        
        score = int((correct_count / len(questions)) * 100)
        passed = score >= quiz['passing_score']
        
        previous_attempts = supabase.table('user_quiz_responses')\
            .select('attempt_number')\
            .eq('user_id', user_id)\
            .eq('quiz_id', quiz_id)\
            .order('attempt_number', desc=True)\
            .limit(1)\
            .execute()
        
        attempt_number = 1
        if previous_attempts.data:
            attempt_number = previous_attempts.data[0]['attempt_number'] + 1
        
        submission_data = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'course_id': quiz['course_id'],
            'module_id': quiz['module_id'],
            'answers': answers,
            'score': score,
            'passed': passed,
            'time_taken_seconds': time_taken_seconds,
            'attempt_number': attempt_number,
            'feedback': {'questions': feedback}
        }
        
        db_response = supabase.table('user_quiz_responses')\
            .insert(submission_data)\
            .execute()
        
        return jsonify({
            'result': db_response.data[0] if db_response.data else None,
            'score': score,
            'passed': passed,
            'correctAnswers': correct_count,
            'totalQuestions': len(questions),
            'feedback': feedback,
            'attemptNumber': attempt_number,
            'message': 'Great job! You passed!' if passed else 'Keep learning! You can try again.'
        })
    
    except Exception as e:
        print(f"Error submitting quiz: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to submit quiz'}), 500

@quizzes_bp.route('/api/quizzes/stats', methods=['GET'])
@require_user
def get_quiz_stats(user_id):
    """Get statistics about user's quiz performance"""
    try:
        response = supabase.table('user_quiz_responses')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        attempts = response.data
        
        if not attempts:
            return jsonify({
                'total': 0,
                'passed': 0,
                'averageScore': 0,
                'totalTime': 0
            })
        
        passed_attempts = [a for a in attempts if a['passed']]
        total_score = sum(a['score'] for a in attempts)
        total_time = sum(a['time_taken_seconds'] for a in attempts if a.get('time_taken_seconds'))
        
        stats = {
            'total': len(attempts),
            'passed': len(passed_attempts),
            'failed': len(attempts) - len(passed_attempts),
            'averageScore': round(total_score / len(attempts), 1),
            'totalTime': total_time,
            'averageTime': round(total_time / len(attempts), 0) if attempts else 0,
            'recentAttempts': sorted(attempts, key=lambda x: x['created_at'], reverse=True)[:5]
        }
        
        return jsonify(stats)
    
    except Exception as e:
        print(f"Error fetching quiz stats: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch quiz stats'}), 500

@quizzes_bp.route('/api/homework/<course_id>/<module_id>', methods=['GET'])
@require_user
def get_homework(user_id, course_id, module_id):
    """Get homework assignment for a specific course module"""
    try:
        response = supabase.table('course_homework')\
            .select('*')\
            .eq('course_id', course_id)\
            .eq('module_id', module_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Homework not found'}), 404
        
        homework = response.data[0]
        
        submissions = supabase.table('user_homework_submissions')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('homework_id', homework['id'])\
            .order('submitted_at', desc=True)\
            .execute()
        
        return jsonify({
            'homework': homework,
            'submissions': submissions.data if submissions.data else []
        })
    
    except Exception as e:
        print(f"Error fetching homework: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch homework'}), 500

@quizzes_bp.route('/api/homework/submit', methods=['POST'])
@require_user
def submit_homework(user_id):
    """Submit homework for AI review"""
    if not openai_client:
        return jsonify({'error': 'AI service not available'}), 503
    
    try:
        data = request.get_json()
        homework_id = data.get('homework_id')
        submission_text = data.get('submission_text', '')
        
        if not homework_id or not submission_text:
            return jsonify({'error': 'homework_id and submission_text are required'}), 400
        
        homework_response = supabase.table('course_homework')\
            .select('*')\
            .eq('id', homework_id)\
            .execute()
        
        if not homework_response.data:
            return jsonify({'error': 'Homework not found'}), 404
        
        homework = homework_response.data[0]
        
        feedback_prompt = f"""Review this student's homework submission and provide constructive feedback.

Homework Assignment:
{homework['title']}
Instructions: {homework['instructions']}

Student Submission:
{submission_text}

Grading Rubric:
{json.dumps(homework.get('rubric', {}), indent=2)}

Provide:
1. Overall assessment (2-3 sentences)
2. Strengths (bullet points)
3. Areas for improvement (bullet points)
4. Score out of 100
5. Specific actionable suggestions

Be encouraging but honest. Focus on practical marketing effectiveness."""
        
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced marketing educator providing constructive feedback on student work."
                },
                {
                    "role": "user",
                    "content": feedback_prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        ai_feedback = ai_response.choices[0].message.content.strip()
        
        try:
            score_line = [line for line in ai_feedback.split('\n') if 'score' in line.lower() or '/100' in line]
            if score_line:
                import re
                score_match = re.search(r'(\d+)', score_line[0])
                ai_score = int(score_match.group(1)) if score_match else 75
            else:
                ai_score = 75
        except:
            ai_score = 75
        
        submission_data = {
            'user_id': user_id,
            'homework_id': homework_id,
            'course_id': homework['course_id'],
            'module_id': homework['module_id'],
            'submission_text': submission_text,
            'ai_feedback': ai_feedback,
            'ai_score': ai_score,
            'status': 'reviewed'
        }
        
        db_response = supabase.table('user_homework_submissions')\
            .insert(submission_data)\
            .execute()
        
        return jsonify({
            'submission': db_response.data[0] if db_response.data else None,
            'feedback': ai_feedback,
            'score': ai_score,
            'message': 'Homework submitted and reviewed!'
        }), 201
    
    except Exception as e:
        print(f"Error submitting homework: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to submit homework'}), 500
