import React from "react";
// Importing Module
import queryString from 'query-string'
  
export const GetParamComponent = class GetParamComponent extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      value : ""

    };

  }
  
  handleQueryString = () => {
    // Parsing the query string 
    // Using parse method

    // let queries = queryString.parse(this.props.location.search);

    let queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const pageType = urlParams.get('hapiId')

    console.log(pageType);

    return this.setState({ value: pageType });
   
    
    // version +:  console.log(queryString)

    //console.log(queries)
    //this.setState(queries)
  }
  
  render() {
    return  (
      <div style={{ margin: 200 }}>

    <span>test print</span><span>{this.state.value}</span> <span>test print 2</span>
  
        <button
          onClick={this.handleQueryString}
          className='btn btn-primary'>
          click me 
        </button>
      </div>
    );
  }
}

export default GetParamComponent;
