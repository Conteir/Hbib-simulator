import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "../components/DisordersAutosuggest";
import { IFrame } from "./IFrameCompoment.jsx";


export const Semantic = class Semantic extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        ICPC2: "",
        showSpinner: false,
    }

  }

  setICPC2code = (suggestion) => {
    if(!suggestion.$codeSystemResult) return;
    this.setState({ ICPC2code: suggestion.$codeSystemResult.code });
    this.setState({showSpinner: true});

  };

  render() {
    return (
      <div>
          <div className="jumbotron text-center">
              <h1>Semantic data</h1>
              <p>Lets see, how clinical decision support and patient information appear in the EHR</p>
          </div>

          <div className="row">
            <div className="col-sm-6">

                <div className="row">
                    <div className="form-group">
                        <label htmlFor="notat">Notat:</label>
                        <textarea
                            aria-label="Notat"
                            id="notat"
                            type="text"
                            autoComplete="off"
                            placeholder=""
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label htmlFor="funn">Funn:</label>
                        <textarea
                            id="funn"
                            type="text"
                            autoComplete="off"
                            placeholder="funn"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label htmlFor="vurdering">Vurdering:</label>
                        <textarea
                            id="vurdering"
                            type="text"
                            autoComplete="off"
                            placeholder="vurdering"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label htmlFor="tiltak">Tiltak:</label>
                        <textarea
                            id="tiltak"
                            type="text"
                            autoComplete="off"
                            placeholder="tiltak"
                        />
                    </div>
                </div>

            </div>

            <div className="col-sm-6">
                <div className="row">
                    <p>Årsak (symptom, plage eller tentativ diagnose):</p>
                </div>

                <div className="form-group">
                    <div className="as-block">
                        <DisordersAutosuggest suggestCallback={this.setICPC2code} codeSystem="ICPC-2"/>
                    </div>
                 
                </div>

               <div>
                    <IFrame
                        className="responsive-iframe" //needs test
                        frameBorder="0"
                        src={
                        "https://semantic.dev.minus-data.no/pasientsky/?icpc-2=" +
                        this.state.ICPC2code
                        }
                        title="semanticData"
                    ></IFrame>
                </div>

              </div>
          </div>

       
          
      </div>
    );
  }
};

export default Semantic;
