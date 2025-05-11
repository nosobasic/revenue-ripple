export default function AffiliateSign() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <a href="/" className="navbar-brand">Revenue Ripple</a>
            <div className="navbar-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/login" className="nav-link">Login</a>
              <a href="/dashboard" className="nav-link">Dashboard</a>
            </div>
          </div>
        </div>
      </nav>
      <div className="container auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Affiliate Account</h1>
          </div>
          <div className="auth-form">
            <p style={{ marginBottom: '1.5rem' }}>
              So you've decided to become an affiliate for this awesome membership site. That's fantastic! As someone who loves spreading the word about things that I'm passionate about, I think it's awesome that you're doing the same. Plus, you'll earn some commission along the way - that's a win-win, right?
              <br /><br />
              To get started, fill the form below. As soon as you sign up, I'm going to send you all the tools you need to start making bank. You can use 'em to drive traffic to your link or advertise in other ways and start earning commissions right away.
              <br /><br />
              Here's the deal: for every other person you refer to us, you'll get a sweet $47.00 per month. That means, if you refer two people, you'll be making $47/month, but if you refer four people, you'll be making $94/month, and the earning just keep going up from there.
              <br /><br />
              And the best part? That money is gonna go straight to your PayPal account, and there's no waiting for monthly or bi-monthly payments. So why wait? Let's get started and make some serious cash together!
              <br /><br />
              <b>Please Note:</b> You must have a verified Premier or Business account in order to receive affiliate payments.
            </p>
            <p>To create your affiliate account, please fill out the form below.</p>
            <form>
              <div className="form-group">
                <label htmlFor="name">First Name</label>
                <input type="text" id="name" name="name" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input type="text" id="lastname" name="lastname" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Preferred Contact Email</label>
                <input type="email" id="contactEmail" name="contactEmail" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="paypal">PayPal Email</label>
                <input type="email" id="paypal" name="paypal" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-input" />
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="cta-button" type="submit">Sign Me Up</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}