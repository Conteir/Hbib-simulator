import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import AutosuggestForSemantic from "../components/AutosuggestForSemantic.jsx";
import { IFrame } from "./IFrameCompoment.jsx";

export const Semantic = class Semantic extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ICPC2code: "",
    };
  }

  setICPC2code = (code) => {
    this.setState({ ICPC2code: code });
  };

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
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

          <div className="col-sm-offset-1 col-sm-4">
            <p>Årsak (symptom, plage eller tentativ diagnose):</p>
            <div className="form-group">
              <AutosuggestForSemantic ICPC2code={this.setICPC2code} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
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
          <div>
            <IFrame
              frameBorder="0"
              src={
                "https://semantic.dev.minus-data.no/pasientsky/?icpc-2=" +
                this.state.ICPC2code
              }
              title="semanticData"
            ></IFrame>
          </div>
        </div>

        {/* the fourth*/}
        <div className="row">
          <div className="col-sm-6">
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
        </div>

        {/* the fifth*/}
        <div className="row">
          <div className="col col-sm-6">
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
      </div>
    );
  }
};

export default Semantic;
