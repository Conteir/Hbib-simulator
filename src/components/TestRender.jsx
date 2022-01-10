import React from "react";
import { Accordion } from "react-bootstrap";

export const TestRender = class TestRender extends React.Component {
  render() {
    return (
      <div>
        <div>{this.renderJson()}</div>
      </div>
    );
  }

 

  renderTitle = (item) => {
    let rootLink = undefined;

    if (Array.isArray(item.links)) {

      rootLink = item.links.find((link) => link.rel === "root");
    }
    return (
      <h2 className="product-context">
          {item.tittel}
         {/* Hentetfra: {rootLink ? rootLink.$title : ""} */}
      </h2>
    );
  };

  renderItem(item) {
    return (
        <Accordion>
            <Accordion.Item name={(this.props.tag ? this.props.tag : '') + item.id}>
        {" "}
        {/** remember id - should be only 1! */}
        <Accordion.Header>
          {/** render rooto title */}
          {this.renderTitle(item)}

          {/* <h1>{item.tittel}</h1> */}
        </Accordion.Header>
        <Accordion.Body>
          {/* zacheeeem name=? 
            <div name={item.id}>
              <h2>
                {item.kortTittel !== item.tittel ? item.kortTittel : null}
              </h2>
            </div>
            */}
          <div name={item.id}>{item.intro ? item.intro : ""}</div>
          {/*<div name={item.id}>
              {item.forstPublisert ? item.forstPublisert.substring(0, 11) : ""}
            </div>*/}
          <div dangerouslySetInnerHTML={{ __html: item.tekst }}></div>

          <Accordion>
          {/* behandlinger handler */}
          {item?.data?.behandlinger ? (
            <Accordion.Header>
              <h2>Behandlinger</h2>
            </Accordion.Header>
          ) : null}
          {item?.data?.behandlinger ? (
            <Accordion.Body>
                {this.renderItemBehandlinger(item.data.behandlinger)}

                {/* commented praktisk */}
                {
                  item?.data?.praktisk ?
                    <div>
                      <b><h1>Praktisk</h1></b>
                      <div dangerouslySetInnerHTML={{ __html: item.data.praktisk.replace(/\\t/g, "")}} ></div>
                    </div> 
                  : null
                }

                {/* begrunnelse */}
                {
                  item.data.rasjonale ? 
                    <div>
                      <b><h1>Begrunnelse – dette er anbefalingen basert på</h1></b>
                      <div dangerouslySetInnerHTML={{ __html: item?.data.rasjonale.replace(/\\t/g, "")}} ></div>
                      
                      { (
                        item?.data.nokkelInfo?.fordelerogulemper && 
                        item?.data.nokkelInfo?.kvalitetdokumentasjon &&
                        item?.data.nokkelInfo?.verdierogpreferanser &&
                        item?.data.nokkelInfo?.ressurshensyn
                        )
                      ?
                        <div>
                          <div className="form-group"><b><h4>Vurdering</h4></b></div>

                          <b>Fordeler og ulemper</b>
                          <div dangerouslySetInnerHTML={{ __html: item?.data.nokkelInfo?.fordelerogulemper}} ></div>

                          <b>Kvalitet på dokumentasjonen</b>
                          <div dangerouslySetInnerHTML={{ __html: item?.data.nokkelInfo?.kvalitetdokumentasjon}} ></div>

                          <b>Verdier og preferanser</b>
                          <div dangerouslySetInnerHTML={{ __html: item?.data.nokkelInfo?.verdierogpreferanser}} ></div>

                          <b>Ressurshensyn</b>
                          <div dangerouslySetInnerHTML={{ __html: item?.data.nokkelInfo?.ressurshensyn}} ></div>

                        </div>

                       : null
                      }

                    </div> 
                  : null
                }

                
            </Accordion.Body>
          ) : null}
          </Accordion>

          <Accordion>
          {item?.data?.rasjonale ? (
            <Accordion.Header>
              <h2>Rasjonale</h2>
            </Accordion.Header>
          ) : null}
          {item?.data?.rasjonale ? (
            <Accordion.Body>
              <div
                dangerouslySetInnerHTML={{ __html: item.data.rasjonale }}
              ></div>
            </Accordion.Body>
          ) : null}
            </Accordion>
          
            
        </Accordion.Body>
      </Accordion.Item> 
      </Accordion>
    );
  }

  renderDoseRegimerHeads(doseringregimer) {
    return doseringregimer.map((doseregime, dosregindex) => {
      return (
        <div key={dosregindex}>
            
          {/* the whole name of dosering regime with dose and administrasjon vei and ladningdose */}
          <div className="form-group"> 

            {
              doseregime?.data?.legemiddeldoseringsregime.koder ?
                doseregime?.data?.legemiddeldoseringsregime.koder.map((legemiddeldoseringsregime, legemindex) => {
                  return (
                    <div key={legemindex}>

                      {/* if landing dose: */}
                      { 
                        (doseregime?.data?.dosering?.eventuellLadningsdose &&
                          doseregime?.data?.dosering?.styrkeEnhetEventuellLadningsdose?.display &&
                            doseregime?.data?.frekvensEventuellladningsdosePerDogn &&
                            doseregime.data.varighetEventuellLadningsdoseAntallDogn) ? 
                            <div> 
                              {
                                doseregime?.data?.dosering?.eventuellLadningsdose ? 
                                  (doseregime.data.legemiddeldoseringsregime?.koder.map((item, index) => {
                                    return (
                                      <div key={index}>
                                          {
                                            item.display
                                            + " " 
                                            + doseregime.data.dosering.eventuellLadningsdose 
                                            + " " 
                                            + doseregime.data.dosering.styrkeEnhetEventuellLadningsdose.display 
                                            + " x " 
                                            + doseregime.data.frekvensEventuellladningsdosePerDogn
                                            + " i "
                                            + doseregime.data.varighetEventuellLadningsdoseAntallDogn
                                            + " " 
                                            + "døgn"
                                            + " "
                                            + "ladningsdose etterfulgt av"
                                          }
                                      </div>
                                      );
                                    }))
                                : null
                              }
                            </div>
                        : null
                      }

                      {/* substance and form */}
                      {legemiddeldoseringsregime?.display ? legemiddeldoseringsregime?.display : null}
                      {" "}

                      {/* if administrasjon vei: */}
                      {
                        doseregime?.data?.administrasjonsvei ? doseregime?.data?.administrasjonsvei?.koder.map((item, index) => {
                          return (
                            <span key={index}>
                              {item?.display ? item.display : null}
                            </span>
                          );
                        }) 
                      : null
                      }
                      {" "}

                      {/* 50 */}
                      {doseregime?.data?.dosering?.dose ? doseregime.data.dosering.dose : null}
                      {" "}

                      {
                        doseregime?.data?.dosering?.styrkeEnhetDosering ? 
                          doseregime?.data?.dosering?.styrkeEnhetDosering?.display
                        : null
                      }

                      {
                        " x "
                      }

                      {
                        doseregime?.data?.frekvensdoseringsregimePerDogn ? 
                          doseregime?.data?.frekvensdoseringsregimePerDogn
                        : null
                      }

                      {
                        doseregime?.data?.varighetDoseringsregimeAntallDogn ? 
                          " i " + 
                          doseregime?.data?.varighetDoseringsregimeAntallDogn 
                          + " døgn"
                        : null
                      }

                    </div>
                  );
                })
              : null
            }

            {
              doseregime?.tekst ? doseregime.tekst : null
            } 

          </div>
        </div>
      );
    })
  }

  renderDoseRegimerHensyn(doseringregimer) {
    return (
      <div>
        <Accordion.Header>
          {
            doseringregimer?.length > 0 && doseringregimer?.some(doseregime => doseregime?.data?.kontraindikasjoner) ? 
              (<h4>Spesielle hensyn: </h4>)
            : null
          }
        </Accordion.Header>

        <Accordion.Body>
          {doseringregimer.map((doseregime, dosregindex) => {
              return (
                <div key={dosregindex}>
                    {/* <div style={{fontWeight: "bold"}}>kontraindikasjoner: {dosregindex + 1}</div> */}
                      {doseregime?.data.kontraindikasjoner ? 
                        doseregime?.data.kontraindikasjoner.map((item, index)=>{
                          let itemText = item?.tekst || null; 
                          return (
                            <div key={index}>
                              
                              {
                                item.data?.tilstand?.koder.map((inneritemt, innerindext)=> {
                                  return (
                                    <div key={innerindext}>
                                      {/* Tilstand */}
                                      {
                                        <h5>{inneritemt?.display ? inneritemt.display : null}</h5>
                                      }
                                    </div>
                                  );

                                })
                              }
                              {
                                item.data.virkestoff.koder.map((inneritemv, innerindexv)=> {
                                  return (
                                    <div key={innerindexv}>
                                      {/* Virkestoff */}
                                      {
                                        <b>{inneritemv?.display ? inneritemv.display : null}</b>
                                      }
                                    </div>
                                  );
                                })
                              }
                              {
                                <div className="form-group" dangerouslySetInnerHTML={{ __html: itemText }}></div>
                              }
                            </div>
                          );
                        }
                      )
                      : null}
                </div>
              );
            })
          }
        </Accordion.Body>
      </div>
    );

      // doseringregimer.map((doseregime, dosregindex) => {
      //   return (
      //     <div key={dosregindex}>                        
      //         <Accordion.Header>
      //           {
      //             doseregime?.data?.kontraindikasjoner ? 
      //               (<h4 style={{color: "green"}}>Spesielle hensyn: </h4>)
      //             : null
      //           }
      //         </Accordion.Header>

      //         <Accordion.Body>
      //           {doseregime?.data.kontraindikasjoner ? 
      //             doseregime?.data.kontraindikasjoner.map((item, index)=>{
      //               let itemText = item?.tekst || null;
      //               return (
      //                 <div key={index}>
                        
      //                   {
      //                     item.data?.tilstand?.koder.map((inneritemt, innerindext)=> {
      //                       return (
      //                         <div key={innerindext}>
      //                           {/* Tilstand */}
      //                           {
      //                             <h5>{inneritemt?.display ? inneritemt.display : null}</h5>
      //                           }
      //                         </div>
      //                       );

      //                     })
      //                   }
      //                   {
      //                     item.data.virkestoff.koder.map((inneritemv, innerindexv)=> {
      //                       return (
      //                         <div key={innerindexv}>
      //                           {/* Virkestoff */}
      //                           {
      //                             <b>{inneritemv?.display ? inneritemv.display : null}</b>
      //                           }
      //                         </div>
      //                       );
      //                     })
      //                   }
      //                   {
      //                     <div className="form-group" dangerouslySetInnerHTML={{ __html: itemText }}></div>
      //                   }
      //                 </div>
      //               );
      //             }
      //           )
      //           : null}
      //         </Accordion.Body>
      //     </div>
      //   );
      // })
  }

  // rendering behandlinger
  renderItemBehandlinger(behandlinger) {
    console.log(behandlinger);
      
    if (behandlinger != null) {
      return (
        behandlinger.map((item, index) => (
          <div key={index}>
            <div className="form-group">
              <b><h1>{item.overskrift ? item.overskrift : ""}</h1></b>
            </div>
            <div dangerouslySetInnerHTML={{ __html: item.behandling.tekst}}></div>
            
            <div className="form-group">
              { item.behandling?.data?.ledetekstVarighetBehandling ? 
                  ("Written out: " 
                  + item.behandling?.data?.ledetekstVarighetBehandling)
                : null
              }
            </div>

            <div className="form-group">
              { item.behandling?.data?.varighetBehandlingAntallDogn ? 
                  ("Anbefalt behandlingsvarighet ved ukomplisert forløp (inkludert eventuell oral behandling): " +
                  item.behandling?.data?.varighetBehandlingAntallDogn + " døgn")
                : null
              }
            </div>


            {/* Standard behandlingsregimer med antibiotika */}
            <div className="form-group">
              {
                item?.behandling?.data?.standardbehandlingsregimer ? 
                  <h2>
                    {
                      item?.behandling?.data?.overskriftBehandlingsregime ?
                        item?.behandling?.data?.overskriftBehandlingsregime 
                      : "Standardbehandling" 
                    }
                    </h2>
                : null
              }
            </div>

            {item?.behandling?.data?.standardbehandlingsregimer ?
              item.behandling.data.standardbehandlingsregimer.map((regime, regIndex) => {
                return (
                  <div key={regIndex}>
                    {/* standardbehandlingsregimer for voksne eller barn */}
                    <div className="form-group"><h3>{regime.overskrift}</h3></div>

                    {regime?.doseringregimer ? this.renderDoseRegimerHeads(regime.doseringregimer) : null}
                    {regime?.doseringregimer ? this.renderDoseRegimerHensyn(regime.doseringregimer) : null}

                  </div>
                );
              })
            : null}

            {/* Behandlingsalternativer (hardcoded title) */}
            <div className="form-group">
              {
                item?.behandling?.data?.alternativebehandlingsregimer ? 
                  <h2>Hardcoded title: Behandlingsalternativer</h2>
                : null
              }     
            </div>  

            {item?.behandling?.data?.alternativebehandlingsregimer ?
              item.behandling.data.alternativebehandlingsregimer.map((regime, regIndex) => {
                return (
                  <div key={regIndex}>
                    {/* alternativebehandlingsregimer for voksne eller barn */}
                     <div className="form-group"><h3>{regime?.overskrift ? regime.overskrift : null}</h3></div>

                     {regime?.doseringregimer ? this.renderDoseRegimerHeads(regime.doseringregimer) : null}
                     {regime?.doseringregimer ? this.renderDoseRegimerHensyn(regime.doseringregimer) : null}

                  </div>
                );
              })
            : null}

            {/* Overgang til oral behandling (hardcoded title) */}
            <div className="form-group">
              {
                item?.behandling?.data?.overgangtiloralbehandlingsregimer ? 
                  <h2>Hardcoded title: Overgang til oral behandling</h2>
                : null
              }
            </div>

            {item?.behandling?.data?.overgangtiloralbehandlingsregimer ?
              item.behandling.data.overgangtiloralbehandlingsregimer.map((regime, regIndex) => {
                return (
                  <div key={regIndex}>
                    {/* overgangtiloralbehandlingsregimer */}
                    {/* make it instead of the harcoded title?:  */}
                    <div className="form-group"><h2>{regime?.overskrift ? regime.overskrift : null}</h2></div>

                    {regime?.doseringregimer ? this.renderDoseRegimerHeads(regime.doseringregimer) : null}
                    {regime?.doseringregimer ? this.renderDoseRegimerHensyn(regime.doseringregimer) : null}

                  </div>
                );
              })
            : null}


          </div>
        ))
      );
    }

  }
  //////////////////////


  renderLinksList(links) {
    if (links != null) {
      //array of children links:
      let barn = [];
      links.forEach((link) => {
        //creating a field manually (name of the link):
        if (link.$title) barn.push(link);
      });

      if (barn.length > 0) {
        return barn.map((item, index) => (
          <li key={index}>
            <div>
              {item.rel === "barn" ? (
                <span>
                  <b>Barn:&nbsp;</b>
                </span>
              ) : null}
              {item.rel === "forelder" ? (
                <span>
                  <b>Forelder:&nbsp;</b>
                </span>
              ) : null}
              {item.rel === "root" ? (
                <span>
                  <b>Root:&nbsp;</b>
                </span>
              ) : null}
              {/*onClick making linkCallback: call the function from HomePage : */}
              <span
                className="link"
                onClick={() => this.props.linkCallback(item.href)}
              >
                {item.$title}
              </span>
            </div>
          </li>
        ));
      }
    }
  }

  renderJson() {
    if (this.props.data) {
      // if the response from HomePage "data={this.state.response}" was recived:
      let json = JSON.parse(this.props.data);

      // check if getId name was added to the home name
      if (Array.isArray(json) && window.location.href.indexOf("getid") > -1) {
        return json.map((item, index) => (
          //...and render of the getIt page happens here
          <div key={index}>
            <div>
              <b>Tittel:</b>
              <span>{item.tittel}</span>
            </div>
            <div>
              <b>ID:</b>
              <span>{item.id}</span>
            </div>
            <br></br>
          </div>
        ));
      }
      // if the home page address remains the same, HomePage render occurs
      else if (
        Array.isArray(json) &&
        !window.location.href.indexOf("getid") > -1
      ) {
        return json.map((item, index) => (
          <div key={index}>
            <div>{this.renderItem(item)}</div>
          </div>
        ));
      } else {
        //
        let item = json;
        return this.renderItem(item, 0);
      }
    }
    // if no responce:
    return "";
  }

  renderLinks(links) {
    if (links != null)
      return links.map((item, index) => (
        <div key={index}>
          <table>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold" }}>Rel</td>
                <td>{item.rel ? item.rel : ""}</td>
              </tr>

              <tr>
                <td style={{ fontWeight: "bold" }}>Type</td>
                <td>{item.type ? item.type : ""}</td>
              </tr>

              <tr>
                {/*onClick making linkCallback: call the function from HomePage : */}
                <td>Href</td>
                <td>
                  <div
                    className="link"
                    onClick={() => this.props.linkCallback(item.href)}
                  >
                    {item.href ? item.href : ""}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Struktur Id</td>
                <td>{item.strukturId ? item.strukturId : ""}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ));
  }

};

export default TestRender;