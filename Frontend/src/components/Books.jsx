import React from 'react'
const Book = (({img, tag }) => {
  return (
    <div className='bookoption'>
      <img src={img} alt="cover" />
      <h2>{description}</h2>
    </div>
  )
})

function Books() {
  return (
    <>
      <div className='book-background'>
        <div>
           <div>
             i will insert book here
           </div>
        </div>
      </div>
    </>
  )
}

export default Books
