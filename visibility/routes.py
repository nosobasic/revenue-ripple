import uuid
from flask import Blueprint,current_app,g,jsonify,request
from middleware.verified_identity import require_auth
from .domain import prepare

visibility_bp=Blueprint('visibility_jobs',__name__)

def rpc(name,**args):
    return current_app.supabase.rpc(name,args).execute().data

def available():
    access=rpc('rr_v_access',p_user=g.user_id)
    # Synthetic provider is only allowed in the explicit local demo harness.
    if access.get('is_fixture') and not current_app.config.get('VISIBILITY_OFFLINE_DEMO'):
        return None
    return access

def unavailable():
    return jsonify(error='Scan service is not enabled yet. Your scan allowance and learning access are unchanged.'),503

@visibility_bp.get('/api/visibility/access')
@require_auth
def access():
    try:
        data=available()
        return jsonify(data) if data is not None else unavailable()
    except Exception:return unavailable()

@visibility_bp.post('/api/visibility/preview')
@require_auth
def preview():
    try:
        if request.content_length and request.content_length>5000:raise ValueError('Input is too large.')
        values,prompts,fingerprint=prepare(request.get_json(silent=True))
        return jsonify(input=values,prompts=prompts,preview_hash=fingerprint,
                       brand_specific=any(values['business_name'].casefold() in p.casefold() or values['domain'] in p.casefold() for p in prompts))
    except (ValueError,TypeError):return jsonify(error='Enter a business name, public website, and a short customer topic.'),400

@visibility_bp.post('/api/visibility/jobs')
@require_auth
def submit():
    try:
        if request.content_length and request.content_length>5000:raise ValueError()
        key=str(uuid.UUID(request.headers.get('Idempotency-Key','')))
        body=request.get_json(silent=True)
        values,prompts,fingerprint=prepare(body)
        if body.get('preview_hash')!=fingerprint:return jsonify(error='Review your three questions before starting.'),409
    except (ValueError,TypeError,AttributeError):return jsonify(error='Please review your scan details and try again.'),400
    try:
        if available() is None:return unavailable()
        data=rpc('rr_v_submit',p_user=g.user_id,p_key=key,p_hash=fingerprint,p_input=values,p_prompts=prompts)
        statuses={'key_conflict':409,'run_in_progress':409,'credits_used':429,'attempt_cap':429,'queue_full':503,'budget_unavailable':503,'unavailable':503}
        return jsonify(data),statuses.get(data.get('error'),202)
    except Exception:
        return jsonify(error='Submission could not be confirmed. Retry unchanged; the same request will not reserve twice.'),503

@visibility_bp.get('/api/visibility/jobs/latest')
@require_auth
def latest():
    try:return jsonify(job=rpc('rr_v_get',p_user=g.user_id))
    except Exception:return unavailable()

@visibility_bp.get('/api/visibility/jobs/<job_id>')
@require_auth
def status(job_id):
    try:job_id=str(uuid.UUID(job_id))
    except ValueError:return jsonify(error='Scan not found.'),404
    try:
        data=rpc('rr_v_get',p_user=g.user_id,p_job=job_id)
        return (jsonify(job=data),200) if data else (jsonify(error='Scan not found.'),404)
    except Exception:return unavailable()
