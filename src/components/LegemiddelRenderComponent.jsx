import React from "react";

export const LegemiddelRenderComponent = class LegemiddelRenderComponent extends React.Component {

  capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
  }

  render() {
    return (
      <ul>
        {this.props.ptArray.map((term, idx) => {
          return (
            <li key={idx}>
              {term?.fatData?.merkevarer ? (
                <span
                  className="link"
                  onClick={() => {
                    term.$showFatData = !term.$showFatData;
                    // trigger render
                    this.setState({ showSpinner: false });
                  }}
                >
                  {this.capitalize(term.term)}
                  {" ("}
                  {term.conceptId}
                  {")"}
                </span>
              ) : (
                <span>
                  {this.capitalize(term.term)}
                  {" ("}
                  {term.conceptId}
                  {")"}
                </span>
              )}

              {term?.fatData?.merkevarer?.length > 0 &&
                term.$showFatData && (
                  <ul>
                    {term.fatData.merkevarer.map((vare, ind) => (
                      <li key={ind}>
                        <p>
                          <b>{"Navn: "}</b>
                          {vare.varenavn}
                          <br />
                          <b>{"Produsent: "}</b>
                          {vare.produsent}
                          <br />
                          <b>{"Administrasjonsvei: "}</b>
                          {vare.administrasjonsveiNavn}
                          <br />
                          <b>{"ATC: "}</b>
                          {vare.atcKode}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          );
        })}
      </ul>
    );
  }

  
};

export default LegemiddelRenderComponent;