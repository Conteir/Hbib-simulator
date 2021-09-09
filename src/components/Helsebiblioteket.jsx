import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "../components/DisordersAutosuggest";
import { Spinner } from 'reactstrap';


export const Helsebiblioteket = class Helsebiblioteket extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        ICPC2: "",
        showSpinner: false,
        showContent: false
    }

  }

  setICPC2code = (suggestion) => {
    if(!suggestion.$codeSystemResult) return;
    this.setState({ ICPC2code: suggestion.$codeSystemResult.code });
    //this.setState({showSpinner: true});
  };

  render() {
    return (
      <div>
          <div className="jumbotron text-center">
              <h1>Helsebiblioteket data</h1>
              <p>Soon...</p>
          </div>

            <div className="row">

                <div className="col-sm-6">
                    <div className="row">
                        <p><b>Term:</b></p>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <DisordersAutosuggest suggestCallback={this.setICPC2code} codeSystem="ICPC-2"/>
                        </div>
                    </div>

                    <div className="row">
                        {this.state.showSpinner ? <Spinner color="success" /> : null}
                    </div>

                </div>
                       
            </div>
 
        </div>
    );
  }
};

export default Helsebiblioteket;
