import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "../components/DisordersAutosuggest";
import { IFrame } from "./IFrameCompoment.jsx";
import { Spinner } from 'reactstrap';



export const Semantic = class Semantic extends React.Component {
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
              <h1>Semantic data</h1>
              <p>Lets see, how clinical decision support and patient information appear in the EHR</p>
          </div>

            <div className="row">
                <div className="col-sm-6">

                    <div className="row">
                        <div className="form-group">
                            <label htmlFor="notat"><b>Notat:</b></label>
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
                            <label htmlFor="funn"><b>Funn:</b></label>
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
                            <label htmlFor="vurdering"><b>Vurdering:</b></label>
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
                            <label htmlFor="tiltak"><b>Tiltak:</b></label>
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
                        <p><b>Årsak (symptom, plage eller tentativ diagnose):</b></p>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <DisordersAutosuggest suggestCallback={this.setICPC2code} codeSystem="ICPC-2"/>
                        </div>
                    </div>

                    <div className="row">
                        {this.state.showSpinner ? <Spinner color="success" /> : null}
                    </div>


                    <div className="row">
                    <div className="col-sm-8">


                        <div id="popup-hapi" className="popupSemantic">
                            <div className="header">
                                <span>Beslutningsstøtte:</span>
                                    <span className="popup-close" onClick={() => this.setState({showContent: false})}>X</span>
                            </div>
                                    
                            <div>
                                <IFrame
                                className="responsive-iframe" //needs test
                                frameBorder="0"
                                width="100%" height="300px"
                                src={
                                "https://semantic.dev.minus-data.no/pasientsky/?icpc-2=" +
                                this.state.ICPC2code
                                }
                                title="semanticData"
                                >   
                                </IFrame>
                            </div>
                        </div>

                    </div>
                    </div>
                </div>
                       
            </div>
 
        </div>
    );
  }
};

export default Semantic;
