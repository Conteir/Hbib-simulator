import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import { proxyFat } from "../config.ts";
import {
  CollapsibleComponent,
  CollapsibleHead,
  CollapsibleContent,
} from "react-collapsible-component";

export const ModalComponent = class ModalComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fatData: {},
      showSpinner: false
    };
  }

  getFatData = () => {
    let arrayWithECLdata = this.props.terms;
    console.log("arrayWithECLdata", arrayWithECLdata);

    arrayWithECLdata.forEach((ecl) => {
      if (ecl.conceptId === "1118951000202108") {
        let fatUrl =
          proxyFat + "/api/medicines/clinical-drugs/" + ecl.conceptId;
        let params = {
          method: "GET",
          headers: {
            Accept: "text/plain"
          },
        };

        // if proxy sucessful and there are no more issues then this consol log should be printed:
        fetch(fatUrl, params)
          .then((response) => response.json())
          .then((fatData) => {
              console.log("Check fatData", fatData); 
              this.setState({ fatData: fatData });     
          });
      }
    });
  };

  render() {
    return (
      <div className="my-modal-backdrop">
        <button onClick={() => this.getFatData()}>get fat</button>
        <div className="my-modal-content">
          <span onClick={() => this.props.onClose()} className="close">
            &times;
          </span>
          {this.props.terms.map((term, idx) => {
            return (
              <li key={idx}>
                {term.term}
                {" ("}
                {term.conceptId}
                {")"}

                {
                  this.state.fatData.merkevarer.length > 0 ? 
                    (this.state.fatData.merkevarer.map( (vare, ind) => {
                      return (
                        <div key={ind}>

                          <li key={idx}>
                            {term.term}
                          
                            {vare.varenavn}
                            {vare.produsent}
                            {vare.administrasjonsveiNavn} 
                            {vare.atcKode}
                          </li>

                        </div>
                      );
                    }))
                  : null
                }

              </li>
            );
          })}
        </div>
      </div>
    );
  }
};

export default ModalComponent;
