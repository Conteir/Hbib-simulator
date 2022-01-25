import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import proxyFat from "../config.ts";

export const ModalComponent = class ModalComponent extends React.Component {
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
            accept: "text/plain",
            "request-context":
              "appId=cid-v1:c310e22f-57ce-4073-ace2-07613f194848",
            server: "Kestrel",
          },
        };

        // if proxy sucessful and there are no more issues then this consol log should be printed:
        fetch(fatUrl, params)
          .then((response) => response.json())
          .then((fatData) => {
            console.log("Check fatData", fatData);
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
              </li>
            );
          })}
        </div>
      </div>
    );
  }
};

export default ModalComponent;
