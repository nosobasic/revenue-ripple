import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StickyCTA({ label = 'Start for $197', to = '/checkout' }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setVisible(window.scrollY > 400);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	if (!visible) return null;

	return (
		<div style={{
			position: 'fixed',
			bottom: 16,
			left: 0,
			right: 0,
			display: 'flex',
			justifyContent: 'center',
			zIndex: 1000
		}}>
			<Link
				to={to}
				className="cta-button"
				style={{
					background: '#2563eb',
					color: '#fff',
					padding: '12px 24px',
					borderRadius: 9999,
					boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
					fontWeight: 700
				}}
			>
				{label}
			</Link>
		</div>
	);
}


