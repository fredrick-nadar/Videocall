import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "../App.css"

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className='LandingPageContainer'>
      <nav>
        <div className='navTitle'>
          <h1 style={{fontSize: "2rem"}}>Welcome to VideoCall</h1>
        </div>
        <div className='navHeader'>
          <button onClick={() => navigate('/auth?mode=register')}>Register</button>
          <button onClick={() => navigate('/auth?mode=signin')}>Sign In</button>
        </div>
      </nav>

      <div className='landingContent '>
        <div className='same'>
          <h2><span style={{color:"orange"}}>Connect</span> with anyone, anywhere</h2>
          <p>Experience seamless video calls with our user-friendly platform. Connect with friends, family, and colleagues effortlessly.</p>
          <div role='button'>
            <Link to="/auth">Get Started</Link>
          </div>
        </div>
        <div className='imgContainer'>
          <img src="/Main.png" alt="" />
        </div>
      </div>

    </div>
  )
}

export default Landing