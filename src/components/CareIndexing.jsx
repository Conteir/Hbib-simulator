import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { AccordionRender } from "./AccordionRender";
// import { TestRender } from "./TestRender";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
import { Accordion } from "react-bootstrap";
import fetchJsonp from "fetch-jsonp";
// import GetParamComponent from "./GetParamComponent.jsx";

const INPUT_VURDERING = {semanticTag: "disorder", field: "VURDERING"};
const INPUT_ANAMNESE = {semanticTag: "finding", field: "ANAMNESE"};
const INPUT_FUNN = {semanticTag: "finding", field: "FUNN"};

export const CareIndexing = class CareIndexing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      env: "",
      data: "",
      title: "",
      matches: -1,
      showContent: false,
      showSpinner: false,
      assessmentData: [],
      preferredTerms: [],
      assessment: '',
      termsWithSemanticTagDisorderForVurdering: [],
      termsWithSemanticTagFindingForAnamnese: [],
      termsWithSemanticTagFindingForFunn: [],
      hdirData: [],
      datasForRenderAnamnese: [],
      datasForRenderFunn: [],
      datasForRenderVurdering: [],
      sctid: "",
      // BMJAnamneseData: [],
      // BMJFunnData: [],
      // BMJVurderingData: [],
      BMJData: {},
      totalBMJEntries: 0
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const valueHapiId = urlParams.get('hapiId');
    if(valueHapiId) {
      const url = helsedirBaseUrl + valueHapiId;
      this.fetchContent(url);
      this.setState({ showContent: true });
    }
  }
  
  // !example from create-concept!
  // getAssessment = (semanticTags) => {
  //   let eventHandler = (evt) => {
  //     let assessment = evt.target.value;
  //     this.setState({ assessment: assessment });
  //     console.log("assessment: ", assessment);
  //     this.sendRequestToCareindexing(assessment, semanticTags);
  //   }
  //   return eventHandler;
  // }

  getAssessment = (input) => (evt) => {
    let assessment = evt.target.value;
    
    this.setState({ assessment: assessment });

    console.log("vurdering: ", assessment);
    console.log("semanticTag: ", input.semanticTag);

    if(input.field === "VURDERING") {
      this.setState({ termsWithSemanticTagDisorderForVurdering: []});
      this.setState({datasForRenderVurdering: []});
    } else if (input.field === "ANAMNESE") {
        this.setState({ termsWithSemanticTagFindingForAnamnese: []});
        this.setState({datasForRenderAnamnese: []});
    } else if (input.field === "FUNN") {
        this.setState({ termsWithSemanticTagFindingForFunn: []});
        this.setState({datasForRenderFunn: []});
    }

    //////////// Delete terms from fields ///////////////
    // Keep Only BMJ Data which conceptIds still exist in the term arrays above
   
    // 1) Join arrays to 1 and clean current array if no terms anymore or use state.arr
    let termsList = [].concat.apply([], [
      input.field === "VURDERING" ? [] : this.state.termsWithSemanticTagDisorderForVurdering,
      input.field === "ANAMNESE" ? [] : this.state.termsWithSemanticTagFindingForAnamnese,
      input.field === "FUNN" ? [] : this.state.termsWithSemanticTagFindingForFunn]
    );

    // 2) Create BMJ data storage for concepts, that should be kept
    let BMJData = {};

    // 3) Delete inside out: 
    // Copy BMJ data from state only if its concept exists in the termsList
    termsList.forEach((term) => { // ...for each existing concept...
      // 3.1 Check if previous BMJData has data for current term's conceptId
      if(this.state.BMJData[term.conceptId] !== undefined) { 
        // ...if exists:
        BMJData[term.conceptId] = this.state.BMJData[term.conceptId];
      }
    });

    // 4. Recalculate matches
    let count = 0;
    // Iterate through OBJECT fields
    for (let field in BMJData) {
      count += BMJData[field].feed?.entry?.length || 0;
    }
    this.setState({BMJData: BMJData, totalBMJEntries: count});


    if(assessment?.length > 0) this.sendRequestToCareindexing(assessment, input);
  };

  sendRequestToCareindexing = (assessment, input) => {
    // setTimeout(() => {
    console.log("current: '" + assessment + "'");

    // if (this.state.assessment === assessment && assessment.length > 0) {
    console.log("sent assessment:" , assessment);

    const parameters = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
        "Accept": "application/json",
        "Origin": "http://smpulse.careindexing.com"
      },  
      body: JSON.stringify({
        payload: assessment
      })
    };

    const careindexingURL = 'https://snowstorm.conteir.no/careindexing/api/v1/annotations/';

    fetch(careindexingURL, parameters)
      .then(response => response.json())
      .then(data => {
        if(this.state.assessment === assessment) {

          // this.setState({ preferredTerms: data});

          console.log("DATA: ", data);
          // console.log("responce with array of objects with preferredTerms: ", this.state.preferredTerms);

          this.useSemanticTags(data, input);
        }
      });
  };

  useSemanticTags = (preferredTerms, input) => {

    let branch = "MAIN/SNOMEDCT-NO/";

    console.log("input", input);
    console.log("preferredTerms without sorting: ", preferredTerms);

    if (Array.isArray(preferredTerms) && preferredTerms.length>0) {

      let ptPromises = [];
      let terms = [];

      let parameters = {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
          "Accept": "application/json",
          "Origin": "http://smpulse.careindexing.com"
        }
      };

      // check unique objects:
      // 1. create an empty obj
      let uniqueTerms = {};

      preferredTerms.forEach((term) => {

        // 2. iterating through each item and trying to get a value:
        if(uniqueTerms[term.code])
          return; // 3. do nothing if the object already has duplicates
          
        // 4. else if there is no term.code field, set this field and set it as true
        uniqueTerms[term.code] = true;
        console.log("unique codes: ", uniqueTerms);

        let sctid = term.code;

        let url = 'https://snowstorm.conteir.no/browser/' + branch +
          'descriptions?term=' + sctid +
          '&active=true&semanticTags=' + input.semanticTag +
          '&groupByConcept=true&searchMode=STANDARD&offset=0&limit=50';  

        // get terms according to semanticTags:
        let ptPromise = fetch(url, parameters)
          .then((response) => response.json())
          .then((data) => {

            if (data.items.length !== 0) {
              data.items.forEach((item) => {
                console.log("item after useSemanticTag (to get conceptId): ", item);
                // send bmj requests with conceptId from item:
                this.getBMJdata(item.concept.conceptId);

                let filteredPTterm = item.concept.pt.term; 
                terms.push( {term: filteredPTterm, conceptId: item.concept.conceptId} );
              });
              console.log("terms during useSemanticTags function: ", terms);
              console.log("this.state.terms during useSemanticTags function: ", this.state.terms);
            }
           
          });
          ptPromises.push(ptPromise);
      });

      Promise.all(ptPromises).then(() => {
        this.getContentForCareIndexing(terms, input.field);

        // this.setState({ data: JSON.stringify(data), showSpinner: false });
        if(input.field === "VURDERING") {
            this.setState({ termsWithSemanticTagDisorderForVurdering: terms});
            console.log("terms With SemanticTag Disorder For Vurdering: ", this.state.termsWithSemanticTagDisorderForVurdering);
        } else if (input.field === "ANAMNESE") {
            this.setState({ termsWithSemanticTagFindingForAnamnese: terms});
            console.log("terms With SemanticTag Finding For Anamnese: ", this.state.termsWithSemanticTagFindingForAnamnese);
        } else if (input.field === "FUNN") {
            this.setState({ termsWithSemanticTagFindingForFunn: terms});
            console.log("terms With SemanticTag Finding For funn: ", this.state.termsWithSemanticTagFindingForFunn);
        }
      });

    }
  }

  getContentForCareIndexing = (terms, field) => {
    if(terms.length > 0) {
      let codeSystemPromises = [];

      terms.forEach((termObj) => {
        // Get code for code system
        const selectedCodeSystem = codeSystemEnv.find(o => o.id === this.state.env);

        if(selectedCodeSystem) {
          let codeSystemPromise = fetch(selectedCodeSystem.url + termObj.conceptId)
          .then((response) => response.json())
          .then((data) => {
            if (data?.items?.length > 0 && 
                data.items[0]?.additionalFields?.mapTarget?.length > 0
            ) { 
              let code = data.items[0].additionalFields.mapTarget;
              // TODO: ask about strange value for codes mapTarget

              // Get data from hdir by code and code system
              const url = helsedirBaseUrl + "?kodeverk=" + this.state.env + "&kode=" + code;

              console.log("hdir url ", url);

              let dataPromise = fetch(url, params)
              .then((response) => response.json())
              .then((hdirData) => {
                console.log("hdirData", hdirData);
                this.setState( {hdirData: hdirData} );
                // deepest level completes a promise (!); returns a string for render
                return JSON.stringify(hdirData);
              });

              return dataPromise;
            } else {
              this.setState( {hdirData: []} );
              console.log("termObj ", termObj.conceptId);
              console.log("An error while getting a code: no code in code system for this sctid: " + termObj.conceptId + "!");
              // alert("An error while getting a code: no code in code system for this sctid: " + termObj.conceptId + "!");
            }
          });

          codeSystemPromises.push(codeSystemPromise);
        }
      });

      Promise.all(codeSystemPromises).then((hdirDataStrings) => {
        if(field === "VURDERING") {
          this.setState({datasForRenderVurdering: hdirDataStrings});
        } else if (field === "ANAMNESE") {
          this.setState({datasForRenderAnamnese: hdirDataStrings});
        } else if (field === "FUNN") {
          this.setState({datasForRenderFunn: hdirDataStrings});
        }
      });
    }
  }


  getBMJdata = (conceptId) => {

    console.log("conceptId in getBMJdata: ", conceptId);

    // this.setState({
    //   BMJAnamneseData:[],
    //   BMJFunnData: [],
    //   BMJVurderingData: [],
    //   totalBMJEntries: 0
    // });

    let BMJrequest = 
    'https://bestpractice.bmj.com/infobutton?knowledgeResponseType=application/javascript&mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=';

    // if (this.state.termsWithSemanticTagFindingForAnamnese.length > 0) {
    if (conceptId?.length > 0) {

      if(this.state.BMJData[conceptId] !== undefined) return;

      // this.state.termsWithSemanticTagFindingForAnamnese.forEach( term => {
      // termsWithSemanticTagFindingForAnamnese.forEach( term => {
        fetchJsonp(BMJrequest + conceptId)
        .then((response) => response.json())
        .then(data => {
          console.log("Data from BMJ", data);
          // let BMJAnamneseData = this.state.BMJAnamneseData;
          let BMJData = this.state.BMJData;
          // BMJAnamneseData.push(data);

          BMJData[conceptId] = data;
          // Calculate total entries
          let count = 0;
          // Iterate through object fields
          for(let field in BMJData) {
            count += BMJData[field].feed?.entry?.length || 0;
          }

          // this.setState({ BMJAnamneseData: BMJAnamneseData, totalBMJEntries: this.state.totalBMJEntries + data?.feed?.entry?.length || 0 });
          this.setState({ BMJData: BMJData, totalBMJEntries: count});
        }).catch(function(ex) {
          console.log('parsing failed', ex)
        });
      // });
    }

    // if (this.state.termsWithSemanticTagFindingForFunn.length > 0) {
    //   this.state.termsWithSemanticTagFindingForFunn.forEach( term => {
    //     fetchJsonp(BMJrequest + term.conceptId)
    //     .then((response) => response.json())
    //     .then(data => {
    //       console.log("Data from BMJ (funn)", data);
    //       let BMJFunnData = this.state.BMJFunnData;
    //       BMJFunnData.push(data);

    //       this.setState({ BMJFunnData: BMJFunnData, totalBMJEntries: this.state.totalBMJEntries + data?.feed?.entry?.length || 0 });
    //     }).catch(function(ex) {
    //       console.log('parsing failed', ex)
    //     });
    //   });
    // }

    // if (this.state.termsWithSemanticTagDisorderForVurdering.length > 0) {
    //   console.log("this.state.termsWithSemanticTagDisorderForVurdering for BMJ: ", this.state.termsWithSemanticTagDisorderForVurdering);
    //   this.state.termsWithSemanticTagDisorderForVurdering.forEach( term => {
    //     fetchJsonp(BMJrequest + term.conceptId)
    //     .then((response) => response.json())
    //     .then(data => {
    //       console.log("Data from BMJ (vurd) ", data);
    //       let BMJVurderingData = this.state.BMJVurderingData;
    //       BMJVurderingData.push(data);

    //       this.setState({ BMJVurderingData: BMJVurderingData, totalBMJEntries: this.state.totalBMJEntries + data?.feed?.entry?.length || 0 });
    //     }).catch(function(ex) {
    //       console.log('parsing failed', ex)
    //     });
    //   });
    // }
  }

  //getting forel and barn link data (h.p.)
  getLinkData = (link) => {
    let promise = fetch(link.href, params)
      .then((response) => response.json())
      .then((data) => {
        link.$title = data.tittel;
      });
    return promise;
  };

  //response: handling and processing (h.p.)
  processResponse = (data) => {
    console.log("Processing response:", data);
    if (!data) return;

    //for links
    let promises = [];

    //Preprocess -> get barn and forelder links titles (h.p)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (Array.isArray(item.links)) {
          // object, going through all links
          item.links.forEach((link) => {
            if (
              link.rel === "barn" ||
              link.rel === "forelder" ||
              link.rel === "root"
            ) {
              promises.push(
                // will be pushed after getLinkData finished
                this.getLinkData(link)
              );
            }
          });
        }
      });

      // Text render demo (commented out now) START
        // check if there is data with required field:
      if (data[0]?.tekst !== undefined) {
        this.setState({ content: data[0].tekst });
      }
      // Text render demo (commented out now) END
    } else {
      if (Array.isArray(data.links)) {
        // object, going through all links
        data.links.forEach((link) => {
          if (
            link.rel === "barn" ||
            link.rel === "forelder" ||
            link.rel === "root"
          ) {
            promises.push(
              // will be pushed after getLinkData finished
              this.getLinkData(link)
            );
          }
        });
      }
    }

    Promise.all(promises).then(() => {
      this.setState({ data: JSON.stringify(data), showSpinner: false });
    });
  };

  // callback to hdir
  linkCallback = (url) => {
    this.setState({ data: "", showSpinner: true });
    fetch(url, params)
      .then((response) => response.json())
      .then(
        (data) => {
          this.processResponse(data);
        },
        () => this.setState({ showSpinner: false })
      );
  };

  suggestCallback = (suggestion) => {
    if (!suggestion.$codeSystemResult) return;

    const codeSystemResult = suggestion.$codeSystemResult;
    const codeSystem = codeSystemResult.codeSystem;
    const code = codeSystemResult.code;

    this.setState( {sctid: code} );

    const url = helsedirBaseUrl + "?kodeverk=" + codeSystem + "&kode=" + code;
    this.fetchContent(url);
  }

  fetchContent = (url) => {
    this.setState({ showSpinner: true });
    this.setState({ matches: -1, data: "", showContent: false });
    

    fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        //console.log("Content for " + codeSystem + ":", data);
        if (Array.isArray(data)) {
          this.setState({ matches: data.length, showSpinner: false });
        }
        if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
          this.setState({
            content: data[0].tekst,
            data: JSON.stringify(data),
            showSpinner: false,
          });

        }
        console.log("So, what is here..?", data);
        this.processResponse(data);
      });
  };

  getBMJamount = () => {
    let counter = 0;

    this.state.BMJAnamneseData.forEach( (obj) => {
      counter += obj?.feed?.entry?.length;
    });
    this.state.BMJFunnData.forEach( (obj) => {
      counter += obj?.feed?.entry?.length;
    });
    this.state.BMJVurderingData.forEach( (obj) => {
      counter += obj?.feed?.entry?.length;
    }); 

    return counter;
  }

  render() {
    return (
      <div>
        <button onClick={() => console.log(this.state)}>Log state</button>
        {/* <button onClick={() => this.getBMJdata()}>Get data</button> */}

        <div className="jumbotron text-center">
          <h1>CareIndexing</h1>
        </div>

        <div className="row, top">
          <div className="col-sm-2">
            <div className="form-group">
              <select
                name="codeSystemEnv"
                id="codeSystemEnv"
                onChange={(evt) => this.setState({ env: evt.target.value })}
              >
                <option value="" select="default">
                  Velg kontekst
                </option>
                {/* Rend  er options dynamically from codeSystemEnv */}
                {codeSystemEnv.map((codeSystem, key) => (
                  <option key={key} value={codeSystem.id}>
                    {codeSystem.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <div className="row">
              <div className="form-group">
                <label htmlFor="anamnese">
                  <b>Anamnese:</b>
                </label>
                <textarea
                  aria-label="Anamnese"
                  id="anamnese"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  onBlur={this.getAssessment(INPUT_ANAMNESE)}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="funn">
                  <b>Funn:</b>
                </label>
                <textarea
                  id="funn"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  onBlur={this.getAssessment(INPUT_FUNN)}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="vurdering">
                  <b>Vurdering:</b>
                </label>
                <textarea
                  id="vurdering"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  onBlur={this.getAssessment(INPUT_VURDERING)}
                />
              </div>
            </div>

            <div className="row">

              <Accordion defaultActiveKey="1">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Beslutningsstøtte</Accordion.Header>

                  <Accordion.Body>
                    
                    <section>
                      {this.state.hdirData > 0 ? 
                        (
                          this.state.datasForRenderAnamnese.length > 0 || 
                          this.state.datasForRenderFunn.length > 0 ||
                          this.state.datasForRenderVurdering.length > 0 ?
                            <h1>
                              Helsedirekotatet [
                                {this.state.datasForRenderAnamnese.length + 
                                this.state.datasForRenderFunn.length +
                                this.state.datasForRenderVurdering.length}
                                  {" "}
                                  document
                                  {
                                    (this.state.datasForRenderAnamnese.length + 
                                    this.state.datasForRenderFunn.length +
                                    this.state.datasForRenderVurdering.length) > 1 ? 
                                    'er' 
                                    : 'et'
                                  }
                              ]
                            </h1> 
                          : null
                        ) 
                        : null}
                      
                      {/* <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>Content from Anamnese</Accordion.Header>
                          <Accordion.Body>
                            {this.state.datasForRenderAnamnese.length > 0 &&
                                this.state.datasForRenderAnamnese.map( (item, index) => {
                                  return (
                                    <div key={index} className="content">
                                      <AccordionRender
                                        data={item}
                                        linkCallback={this.linkCallback}
                                        // hideMetadata={true}
                                        // hideLinksNavigation={true}
                                        tag="anamnese"
                                    />
                                    </div>
                                  );
                              })
                            }
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion> */}

                      {/* <Accordion defaultActiveKey="6"> */}

                      {this.state.datasForRenderAnamnese.length > 0 &&
                          this.state.datasForRenderAnamnese.map( (item, index) => {
                            return (
                              <div key={index} className="content">
                                <AccordionRender
                                  // TestRender
                                  data={item}
                                  linkCallback={this.linkCallback}
                                  tag="anamnese"
                                />
                              </div>
                            );
                        })
                      }

                      {this.state.datasForRenderFunn.length > 0 &&
                          this.state.datasForRenderFunn.map( (item, index) => {
                            return (
                              <div key={index} className="content">
                                <AccordionRender
                                  // TestRender
                                  data={item}
                                  linkCallback={this.linkCallback}
                                  tag="funn"
                                />
                              </div>
                            );
                        })
                      }

                      {this.state.datasForRenderVurdering.length > 0 &&
                          this.state.datasForRenderVurdering.map( (item, index) => {
                            return (
                              <div key={index} className="content">
                                <AccordionRender
                                  // TestRender
                                  data={item}
                                  linkCallback={this.linkCallback}
                                  tag="vurdering"
                                />
                              </div>
                            );
                        })
                      }

                      {/* </Accordion> */}


                      {/* <Accordion defaultActiveKey="3">
                        <Accordion.Item eventKey="8">
                          <Accordion.Header>Title content 2</Accordion.Header>
                          <Accordion.Body>Text content 2</Accordion.Body>
                        </Accordion.Item>
                      </Accordion> */}

                    </section>

                    <section>
                      {this.state.totalBMJEntries > 0 ?  <h1>BMJ</h1> : ""}

                      {/* > TODO: reset state when adding new terms */}
                      {/* > TODO: condition if content from BMJ exists */}
                      {/* TODO: add each link to a separate block ? */}
                      {/* > TODO: to show only unique links? */}
                      {/* TODO: entr.link[0] is always 0 ? */}
                      {/* TODO: no button with get data */}
                       
                      {/* {
                        ( (this.getBMJamount() > 0) ? 
                          ("[" + this.getBMJamount() + "] dokument" + ( (this.getBMJamount() > 1) ? "er" : "et"))
                        : "")
                      } */}
                         
                      {
                        ( (this.state.totalBMJEntries > 0) ? 
                          ("[" + this.state.totalBMJEntries + "] dokument" + ( (this.state.totalBMJEntries > 1) ? "er" : "et"))
                        : "")
                      }

                           {/* {this.state.BMJAnamneseData.map( (obj, key) => {
                               return (
                                 <div key={key}>
                                   {obj?.feed?.entry?.length || 0}
                                 </div>
                               );
                            })}
                           {this.state.BMJFunnData.map( (obj, key) => {
                                 return (
                                 <div key={key}>
                                     {obj?.feed?.entry?.length || 0}
                                   </div>
                              );
                            })}
                           {this.state.BMJVurderingData.map( (obj, key) => {
                                 return (
                                   <div key={key}>
                                     {obj?.feed?.entry?.length || 0}
                                   </div>
                                 );
                            })} */}
                      

                      <div>
                        {Object.keys(this.state.BMJData).map( (field, key) => {

                          if(this.state.BMJData[field].feed?.entry?.length > 0) {

                            return (
                              <div key={key}>
                                {this.state.BMJData[field].feed.entry.map( (entr, idx) => {
                                  return (
                                    <p key={idx}>
                                      <a
                                        href={entr.link[0].href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {entr.link[0].title}
                                      </a>
                                    </p>
                                  );
                                })}
                              </div>
                            );

                          } else return "";

                        })}
                      </div>

                      {/* <div>
                        {this.state.BMJFunnData.map( (obj, key) => {

                          if(obj.feed?.entry?.length > 0) {

                            return (
                              <div key={key}>
                                {obj.feed.entry.map( (entr, idx) => {
                                  return (
                                    <p key={idx}>
                                      <a
                                        href={entr.link[0].href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {entr.link[0].title}
                                      </a>
                                    </p>
                                  );
                                })}
                              </div>
                            );

                          } else return "";

                        })}
                      </div> */}

                      {/* <div>
                        {this.state.BMJVurderingData.map( (obj, key) => {

                          if(obj.feed?.entry?.length > 0) {

                            return (
                              <div key={key}>
                                {obj.feed.entry.map( (entr, idx) => {
                                  return (
                                    <p key={idx}>
                                      <a
                                        href={entr.link[0].href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {entr.link[0].title}
                                      </a>
                                    </p>
                                  );
                                })}
                              </div>
                            );

                          } else return "";
                          
                        })}
                      </div> */}
                    </section>

                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

            </div>


            <div className="row">
              <div className="form-group">
                <label htmlFor="tiltak">
                  <b>Tiltak:</b>
                </label>
                <textarea
                  id="tiltak"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="row">
              <p>
                <b>Problemstilling:</b>
              </p>
            </div>

            <div className="row">
              <div className="col-sm-8">
                <DisordersAutosuggest
                  suggestCallback={this.suggestCallback}
                  codeSystem={this.state.env}
                  placeholder="Årsak (symptom, plage eller tentativ diagnose):"
                />
              </div>

              {/* Badge with amount of matches */}
              <div className="col-sm-4 match-block">
                {this.state.matches > 0 ? (
                  <div>
                    <span
                      onClick={() => {
                        this.setState({ showContent: true });
                      }}
                      className="badge badge-primary"
                    >
                      {" "}
                      {this.state.matches}{" "}
                    </span>
                  </div>
                ) : this.state.matches === 0 ? (
                  <div>No content matches this code</div>
                ) : null}
              </div>
            </div>

            <div className="row">
              {this.state.showSpinner ? <Spinner color="success" /> : null}
            </div>

            {/* HAPI render */}
            <div className="row">
              <div className="col-sm-8">
                {/* this.state.showContent ? <HTMLRender data={this.state.data} linkCallback={this.linkCallback} /> : null */}
                {this.state.showContent ? (
                  <div id="popup-hapi" className="popupHAPI">
                    <div className="header">
                      <span>Beslutningsstøtte</span>
                      <span
                        className="popup-close"
                        onClick={() => this.setState({ showContent: false })}
                      >
                        X
                      </span>
                    </div>
                    <div className="content">
                      <HTMLRender
                        data={this.state.data}
                        linkCallback={this.linkCallback}
                        hideMetadata={true}
                        hideLinksNavigation={true}
                      />{" "}
                      {/** --> hide metadata */}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Preferred terms' render: */}
            <div className="row">
              {
                this.state.datasForRenderAnamnese.length > 0 || 
                this.state.datasForRenderFunn.length > 0 || 
                this.state.datasForRenderVurdering.length > 0 ? 
                  <div className="row">
                    <h2 className="small">SNOMED CT-konsepter funnet ved NPL</h2>
                  </div>
                : null
              }
            </div>
            
            {/* Anamnese: */}
            <div className="row">
              {this.state.datasForRenderAnamnese.length > 0 ? 
                <h3 className="small">SNOMED CT-konsepter (kliniske funn) funnet i feltet Anamnese</h3>
              : null}
              {
                this.state.termsWithSemanticTagFindingForAnamnese.map((term, index) => {
                  console.log("termsWithSemanticTagFindingForAnamnese: ", this.state.termsWithSemanticTagFindingForAnamnese);
                    return (
                      <div key={index+1}>
                        <ul>
                          <li>{term.term}</li>
                        </ul>
                      </div>
                      );
                })
              }
            </div>

            {/* Funn: */}
            <div className="row">
              {this.state.datasForRenderFunn.length > 0 ? 
                <h3 className="small">SNOMED CT-konsepter (kliniske funn) funnet i feltet Funn</h3>
              : null}
                {
                  this.state.termsWithSemanticTagFindingForFunn.map((term, index) => {
                    console.log("termsWithSemanticTagFindingForFunn: ", this.state.termsWithSemanticTagFindingForFunn);
                      return (
                        <div key={index+1}>
                          <ul>
                            <li>{term.term}</li>
                          </ul>
                        </div>
                        );
                  })
                }
            </div>

            {/* Vurdering: */}
            <div className="row">
              {this.state.datasForRenderVurdering.length > 0 ? 
                (<h3 className="small">SNOMED CT-konsepter (sykdom/tilstand) funnet i feltet Vurdering</h3>)
              : null}
              {this.state.termsWithSemanticTagDisorderForVurdering.map((term, index) => {
                console.log("termsWithSemanticTagDisorderForVurdering: ", this.state.termsWithSemanticTagDisorderForVurdering);
                  return (
                    <div key={index+1}>
                      <ul>
                        <li>{term.term}</li>
                      </ul>
                    </div>
                  );
                })
              }
            </div>

          </div>
        </div>
      </div>
    );
  }
};

export default CareIndexing;
