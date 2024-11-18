import React from 'react'
import image from '../images/home.jpg'

const Home = () => {
    const bodyStyle = {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // Ensure the background covers the entire viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color:"white"
    }
    
  return (
    <div style={bodyStyle}>
      <div className="body">
      </div>
    </div>
  )
}

export default Home
