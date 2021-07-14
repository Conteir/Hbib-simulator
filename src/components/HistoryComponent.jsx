/*
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function History(){
  const [term, setTerm] = useState([])
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState(false)

  const addItem  = (e)  => {
    e.preventDefault();
    if(error) return;


    const tempData = [...term];
    tempData.push(textInput)
    setTerm(tempData)
    setTextInput("")
  }

  useEffect(() => {
    if(textInput.length > 20) setError(true);
    else setError(false)
  }, [textInput])

  const removeItem = (index) => {
    let newData = [...term]
    newData.splice(index, 1)
    setTerm(newData)
  }

  const editItem = (index) => {
    if(error) return;

    let newData = [...term]
    newData[index] = textInput;

    setTerm(newData)
  }


  console.log(term)

    return (
        <div>
         <h1>History</h1>
         <Link to="/">Click here to go to home page (Home)</Link>
         <form onSubmit={addItem}>
            <label>text input: 
              <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value) }></input>
            </label>
            <input type="submit" value="Submit"/>
         </form>
         {error ? <span style={{color: "red"}}>Error occured</span> : null}
         {
           term.map((item, index) =>{
             return (
               <li key={index}>{item} <button onClick={() => removeItem(index)}>Remove</button><button onClick={() => editItem(index)}>Update</button></li>
             )
           } )
         }
        </div>
      )
}

export default History;

*/
