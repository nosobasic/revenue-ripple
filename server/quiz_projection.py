"""Projection for a quiz before grading; never return the answer key."""
def public_quiz(quiz):
    if quiz is None:
        return None
    allowed = ('id', 'course_id', 'module_id', 'title', 'description',
               'passing_score', 'time_limit_minutes', 'created_at', 'updated_at')
    result = {key: quiz[key] for key in allowed if key in quiz}
    result['questions'] = []
    for question in quiz.get('questions') or []:
        safe = {key: question[key] for key in ('id', 'question') if key in question}
        safe['options'] = [{key: option[key] for key in ('id', 'text') if key in option}
                           for option in question.get('options') or []]
        result['questions'].append(safe)
    return result
