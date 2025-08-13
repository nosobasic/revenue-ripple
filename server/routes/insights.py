from flask import Blueprint, jsonify, g, request
from datetime import datetime
from supabase import create_client
import os

from middleware.auth import require_auth
from middleware.entitlements import require_tier, resolve_tier, increment_suggestions_usage, has_core_quota

insights_bp = Blueprint('insights_bp', __name__, url_prefix='/insights/api')


def _get_supabase():
	supabase_url = os.getenv('SUPABASE_URL')
	supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
	return create_client(supabase_url, supabase_key)


@insights_bp.route('/auth/debug', methods=['GET'])
@require_auth
def auth_debug():
	"""Debug endpoint; remove for production."""
	tier = resolve_tier(g.user_id)
	return jsonify({ 'user_id': g.user_id, 'email': g.email, 'tier': tier })


@insights_bp.route('/insight-of-day', methods=['GET'])
@require_auth
def insight_of_day():
	sb = _get_supabase()
	day = datetime.utcnow().strftime('%Y-%m-%d')
	business_id = request.args.get('business_id')
	# Try cache first
	query = sb.table('insight_daily_cache').select('*').eq('user_id', g.user_id).eq('day', day)
	if business_id:
		query = query.eq('business_id', business_id)
	res = query.single().execute()
	if getattr(res, 'data', None):
		return jsonify(res.data)
	# Generate a basic stub insight
	insight = {
		'user_id': g.user_id,
		'business_id': business_id,
		'day': day,
		'suggestion': 'Publish a short authority post today summarizing a key lesson from your last campaign.',
		'title': 'Post an Authority Nugget',
		'source': 'heuristic'
	}
	inserted = sb.table('insight_daily_cache').upsert(insight, on_conflict='user_id,day,business_id').execute()
	return jsonify((inserted.data or [insight])[0])


@insights_bp.route('/prompt-suggestions', methods=['GET'])
@require_auth
def prompt_suggestions():
	user_tier = resolve_tier(g.user_id)
	if user_tier == 'core':
		allowed, used = has_core_quota(g.user_id)
		if not allowed:
			return jsonify({ 'error': 'quota_exceeded', 'used': used, 'limit': 25 }), 403
		# Increment usage for core users
		increment_suggestions_usage(g.user_id)
	# Stub suggestions
	suggestions = [
		{ 'id': 's1', 'title': 'Email Outreach Prompt', 'prompt': 'Write a re-engagement email for subscribers who have not opened the last 3 emails.'},
		{ 'id': 's2', 'title': 'Blog Post Prompt', 'prompt': 'Draft a 700-word blog post on "Top 5 mistakes in our industry" including actionable tips.'},
		{ 'id': 's3', 'title': 'Ad Copy Prompt', 'prompt': 'Create 3 variations of a short Facebook ad promoting our lead magnet.'}
	]
	return jsonify({ 'items': suggestions })


@insights_bp.route('/competitors', methods=['GET'])
@require_auth
@require_tier(['growth', 'partner'])
def competitors():
	return jsonify({ 'items': [
		{ 'name': 'Acme Marketing', 'strength': 'SEO content', 'gap': 'Email nurturing' },
		{ 'name': 'FunnelPro', 'strength': 'Funnels', 'gap': 'Organic social' },
		{ 'name': 'AdBoost', 'strength': 'Paid ads', 'gap': 'Content repurposing' },
	]})


@insights_bp.route('/analytics', methods=['GET'])
@require_auth
def analytics():
	# Minimal stubbed analytics
	return jsonify({
		'funnel': { 'visits': 1240, 'optins': 220, 'sales': 37 },
		'conversion': { 'optinRate': 0.177, 'salesRate': 0.168 },
		'lastUpdated': datetime.utcnow().isoformat() + 'Z'
	})