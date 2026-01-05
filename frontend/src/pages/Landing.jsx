import React from 'react'
import { Link } from 'react-router-dom'
import "../App.css"

const Landing = () => {
  return (
    <div className='LandingPageContainer'>
      <nav>
        <div className='navTitle'>
          <h1 style={{fontSize: "2rem"}}>Welcome to VideoCall</h1>
        </div>
        <div className='navHeader'>
          <button>Join as Guest</button>
          <button>Register</button>
          <button>Sign In</button>
        </div>
      </nav>

      <div className='landingContent '>
        <div className='same'>
          <h2><span style={{color:"orange"}}>Connect</span> with anyone, anywhere</h2>
          <p>Experience seamless video calls with our user-friendly platform. Connect with friends, family, and colleagues effortlessly.</p>
          <div role='button'>
            <Link to="/home">Get Started</Link>
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