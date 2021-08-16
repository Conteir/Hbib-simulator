import React from "react";
import {
  CollapsibleComponent,
  CollapsibleHead,
  CollapsibleContent,
} from "react-collapsible-component";

export const HTMLRender = class HTMLRender extends React.Component {
  render() {
    return (
      <div>
        <div>{this.renderJson()}</div>
      </div>
    );
  }

  renderItemMetadata(item) {
    return (
      <table>
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold" }}>Id</td>
            <td>{item.id ? item.id : null}</td>
          </tr>

          <tr>
            <td style={{ fontWeight: "bold" }}>Eier</td>
            <td>{item.eier ? item.eier : null}</td>
          </tr>

          <tr>
            <td style={{ fontWeight: "bold" }}>Sist Oppdatert</td>
            <td>{item.sistOppdatert ? item.sistOppdatert : null}</td>
          </tr>

          {item.forstPublisert ? (
            <tr>
              <td>Forst Publisert</td>
              <td>{item.forstPublisert}</td>
            </tr>
          ) : null}

          {item.gruppeId ? (
            <tr>
              <td>Gruppe Id</td>
              <td>{item.gruppeId}</td>
            </tr>
          ) : null}

          {item?.koder?.["ICPC-2"] ? (
            <tr>
              <td>ICPC-2</td>
              <td>{item?.koder["ICPC-2"]}</td>
            </tr>
          ) : null}

          {item?.koder?.["ICD-10"] ? (
            <tr>
              <td>ICD-10</td>
              <td>{item?.koder["ICD-10"]}</td>
            </tr>
          ) : null}

          {item?.koder?.["lis-spesialitet"] ? (
            <tr>
              <td>lis-spesialitet</td>
              <td>{item?.koder["lis-spesialitet"]}</td>
            </tr>
          ) : null}

          {item?.koder?.["lis-laeringsmaal"] ? (
            <tr>
              <td>lis-laeringsmaal</td>
              <td>{item?.koder["lis-laeringsmaal"]}</td>
            </tr>
          ) : null}

          {item?.koder?.["SNOMED-CT"] ? (
            <tr>
              <td>SNOMED-CT</td>
              <td>{item?.koder["SNOMED-CT"]}</td>
            </tr>
          ) : null}

          <tr>
            <td style={{ fontWeight: "bold" }} colSpan="2">
              Tekniske data
            </td>
            <td>{item.tekniskeData ? "" : "none"}</td>
          </tr>

          <tr>
            <td style={{ fontWeight: "bold" }}>Info Id</td>
            <td>
              {item.tekniskeData && item.tekniskeData.infoId
                ? item.tekniskeData.infoId
                : ""}
            </td>
          </tr>

          <tr>
            <td style={{ fontWeight: "bold" }}>Info type</td>
            <td>
              {item.tekniskeData && item.tekniskeData.infoType
                ? item.tekniskeData.infoType
                : ""}
            </td>
          </tr>

          {item.tekniskeData && item.tekniskeData.subType ? (
            <tr>
              <td>Subtype</td>
              <td>{item.tekniskeData.subType}</td>
            </tr>
          ) : null}

          {item.tekniskeData && item.tekniskeData.HapiId ? (
            <tr>
              <td>HAPI id</td>
              <td>{item.tekniskeData.HapiId}</td>
            </tr>
          ) : null}

          {/*
                  {
                    Array.isArray(item.tema) ?
                      <tr>
                        <td colSpan="2">{this.renderTema(item.tema)}</td>
                      </tr>
                      : null
                  }
                */}

          {
            //rendering links for metadata
            Array.isArray(item.links) ? (
              <tr>
                <td colSpan="2">{this.renderLinks(item.links)}</td>
              </tr>
            ) : null
          }

          {item.attachments ? (
            <tr>
              <td>Attachments</td>
              <td>{item.attachments}</td>
            </tr>
          ) : null}

          <tr>
            <td style={{ fontWeight: "bold" }}>Dokument type</td>
            <td>{item.dokumentType ? item.dokumentType : ""}</td>
          </tr>

          <tr>
            <td style={{ fontWeight: "bold" }}>Sist importert til Hapi</td>
            <td>
              {item.sistImportertTilHapi ? item.sistImportertTilHapi : ""}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderTitle = (item) => {
    let rootLink = undefined;

    if (Array.isArray(item.links)) {
      /*
        item.links.forEach(link => {
          if (link.rel==='root') {
            rootLink = link;
          }
        });
      */

      rootLink = item.links.find((link) => link.rel === "root");
    }
    return (
      <h2 className="product-context">
        Hentet fra: {rootLink ? rootLink.$title : ""}
      </h2>
    );
  };

  renderItem(item) {
    return (
      <CollapsibleComponent name={item.id}>
        {" "}
        {/** remember id - should be only 1! */}
        <CollapsibleHead>
          {/** render rooto title */}
          {this.renderTitle(item)}

          <h1>{item.tittel}</h1>
        </CollapsibleHead>
        <CollapsibleContent>
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


          {/* behandlinger handler */}
          {item?.data?.behandlinger ? (
            <CollapsibleHead>
              <h2>Behandlinger</h2>
            </CollapsibleHead>
          ) : null}
          {item?.data?.behandlinger ? (
            <CollapsibleContent>
                {this.renderItemBehandlinger(item.data.behandlinger)}
                {/* commented praktisk */}
                {/* {item?.data?.praktisk ?
                  <div>
                    <b>Praktisk</b>
                    <div dangerouslySetInnerHTML={{ __html: item.data.praktisk.replace(/\\t/g, "")}} ></div>
                  </div> : null
                } */}
            </CollapsibleContent>
          ) : null}


          {item?.data?.rasjonale ? (
            <CollapsibleHead>
              <h2>Rasjonale</h2>
            </CollapsibleHead>
          ) : null}
          {item?.data?.rasjonale ? (
            <CollapsibleContent>
              <div
                dangerouslySetInnerHTML={{ __html: item.data.rasjonale }}
              ></div>
            </CollapsibleContent>
          ) : null}

          {/**creating props to pass it to child component */}
          {!this.props.hideMetadata ? (
            <div>
              <CollapsibleHead>
                <h2>Metadata</h2>
              </CollapsibleHead>
              <CollapsibleContent>
                {this.renderItemMetadata(item)}{" "}
              </CollapsibleContent>
            </div>
          ) : null}

          {/**creating props to pass it to child component */}
          {!this.props.hideLinksNavigation ? (
            <div>
              <CollapsibleHead>
                <h2>Links navigation</h2>
              </CollapsibleHead>
              <CollapsibleContent>
                <ol>
                  {/* rendering links list for navigation block */}
                  {this.renderLinksList(item.links)}
                </ol>
              </CollapsibleContent>
            </div>
          ) : null}
        </CollapsibleContent>
      </CollapsibleComponent> // wrapped the content
    );
  }

  
  /////////////////////////////////////////
  // rendering behandlinger
  renderItemBehandlinger(behandlinger) {
    console.log(behandlinger);
    console.log("Test!");
      
    if (behandlinger != null) {
      return (
        behandlinger.map((item, index) => (
          <div key={index}>
            <b>{item.overskrift ? item.overskrift : ""}</b>
            <div dangerouslySetInnerHTML={{ __html: item.behandling.tekst}}></div>

            <b>Standard behandlingsregimer med antibiotika</b>

            {item?.behandling?.data?.standardbehandlingsregimer ?
              item.behandling.data.standardbehandlingsregimer.map((regime, regIndex) => {
                return (
                  <div key={regIndex}>
                    {/* standardbehandlingsregimer for voksne eller barn */}
                    <b>{regime.overskrift}</b>

                    {regime?.doseringregimer ? 
                      regime.doseringregimer.map((doseregime, dosregindex) => {
                        return (
                          <div key={dosregindex}>
                            <em>Dose regime marker (delete this string later) - {doseregime.kortTittel}</em>

                            {doseregime?.data?.kontraindikasjoner ?
                              doseregime.data.kontraindikasjoner.map((kont, kontindex) => {

                                let kontKodeTitle = kont?.data?.tilstand?.koder.find(kode => kode.display !== undefined);
                                let drugKodeTitle = kont?.data?.virkestoff?.koder.find(kode => kode.display !== undefined);
                                let kontText = kont?.tekst || "Text field was not provided!";

                                return (
                                  <div key={kontindex}>
                                    {kontKodeTitle ? <div>-Title: {kontKodeTitle.display}</div> : null}
                                    {drugKodeTitle ? <div>=Drug: {drugKodeTitle.display}</div> : null}
                                    {/* {kontText ? <div>=Tekst: {kontText}</div> : null} */}
                                    <div dangerouslySetInnerHTML={{ __html: kontText}}></div>

                                  </div>
                                );
                              })
                            : null}
                          </div>);
                      })
                    : null}
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

  /*renderTema(tema) {

    if (tema != null)

      return tema.map((item, index) =>
     
        <div key={index}>
          
          <table><tbody>

            <tr>
              <td style={{ fontWeight: "bold"}}>Tema</td><td>{item.tema ? item.tema : null }</td>
            </tr>

          </tbody></table>

        </div>);
  } */
};

export default HTMLRender;
