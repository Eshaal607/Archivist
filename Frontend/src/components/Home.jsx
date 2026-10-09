import React from 'react'
import searchIcon from '../assets/search-icon.png'
import booksIcon from '../assets/books-icon.png'
import diceIcon from '../assets/dice-icon.png'

const Card = (({img, description }) => {
  return (
    <div className='card'>
      <img src={img} alt="icon" />
      <h2>{description}</h2>
    </div>
  )
})

function Home() {

      const handleMouseOver = () => {
    console.log("hovering");
  };

  const handleClick = () => {
    console.log("clicked");
  };

  return (
     <>
          <div className='hero-background'>
            <section id='Center'>
              <h1 className='Archivist'>Archivist</h1>
              <p className='liner'>Every story leads to another</p>
            </section>
    
            <div onMouseOver={handleMouseOver}  className='question-card'>
              <h2 className='question'>Choose Your Path</h2>
            </div>
    
            <div onClick={handleClick} className='cards'>
              <Card img={searchIcon}
                description={"Similar to one you loved"}
              />
              <Card img={booksIcon}
                description={"Explore by path"}
              />
              <Card img={diceIcon}
                description={`Surprise Me A random pick`}
              />
            </div>
          </div>
        </>
  )
}

export default Home
