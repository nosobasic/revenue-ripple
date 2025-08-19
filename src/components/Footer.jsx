export default function Footer() {
	return (
		<footer style={{ borderTop: '1px solid #e5e7eb', marginTop: 32 }}>
			<div className="container mx-auto px-6" style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
				<div style={{ color: '#6b7280', fontSize: 14 }}>© {new Date().getFullYear()} Revenue Ripple</div>
				<div style={{ display: 'flex', gap: 16 }}>
					<a href="/privacy" style={{ color: '#4b5563', fontSize: 14 }}>Privacy</a>
					<a href="/terms" style={{ color: '#4b5563', fontSize: 14 }}>Terms</a>
				</div>
			</div>
		</footer>
	);
}


