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
    const hapiId = urlParams.get('hapiId')
    console.log(hapiId);

    return this.setState({ value: hapiId });
   
    
    // version +:  console.log(queryString)

    //console.log(queries)
    //this.setState(queries)
  }

  /*fetchContentByHapiId = (value) => {
    this.setState({ showSpinner: true });
    // reset state to clean results before new loading
    this.setState({ matches: -1, data: "", showContent: false });
    // API key depends on environment: current -> Production
    if (!value) return;

   
    const hdBaseUrl = "https://api.helsedirektoratet.no/innhold/innhold";
    const url = hdBaseUrl + "?kodeverk=" + codeSystem + "&kode=" + code;

    fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        console.log("Content for " + codeSystem + ":", data);
        if (Array.isArray(data)) {
          this.setState({ matches: data.length, showSpinner: false });
        }
        if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
          this.setState({
            content: data[0].tekst,
            data: JSON.stringify(data),
            showSpinner: false,
          });

          console.log("Content for " + codeSystem + ":", data);
          console.log("Content for " + codeSystem + ":", data.length);
        }

        this.processResponse(data);
      });
  };*/
  
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
