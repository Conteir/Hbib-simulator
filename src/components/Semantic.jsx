import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';
import AutosuggestForSemantic from '../components/AutosuggestForSemantic.jsx';
import { IFrame } from './IFrameCompoment.jsx';

export const Semantic = class Semantic extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
            response: '',
            icpc2Content: '',
            icd10Content: ''
        };
      }

      codeSystemPromise = (url) => {
        let promise = fetch(url,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        ).then(response => response.json());
        return promise;
      };
    
    // Getting a content from autosuggest
    fetchContent = (usersInput) => {
        let promises = [];
        let content = {};

          // ICPC2
        let semanticURL = 
        "https://semantic.dev.minus-data.no/pasientsky/?icpc-2=" + usersInput;

        let promiseICPC2 = fetch(semanticURL)
            .then(response => response.json())
            .then(data => {
                console.log('ICPC-2', data);
                if(data && Array.isArray(data.items) && data.items.length > 0) {
                    if(data.items[0]?.additionalFields?.mapTarget) {
                        content.icpc2 = {
                            code: data.items[0]?.additionalFields?.mapTarget
                        };
                    }
                }  
            });
        promises.push(promiseICPC2);
            

        Promise.all(promises).then(() => {
            let contentPromises = [];
            // Fetch by ICPC2 if available

            if(content.icpc2) {
                let url = semanticURL;
                let promiseICPC2Content = fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log('icpc2 items:', data);
                        if(Array.isArray(data) && data.length > 0 && data[0].tekst) {
                            content.icpc2.text = data[0].tekst;
                        }
                    });
                contentPromises.push(promiseICPC2Content);
            }

            Promise.all(contentPromises).then(() => {
                console.log('Content', content);

                //making render for icpc
                if(content?.icpc2?.text) {
                    this.setState({icpc2Content: content.icpc2.text});
                    
                }

                //making render for icd
                if(content?.icd10?.text) {
                    this.setState({icd10Content: content.icd10.text});
                }
            });
        });
    }
        

    

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

                        {/* Pass this.state.env as codeSystem to AutosuggestForSemantic
                            in order to get the correct code system url inside AutosuggestForSemantic
                        */}
                        <AutosuggestForSemantic suggestCallback={this.fetchContent}/>
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
                 
                   

                {/* rendering the thml-response */}
                    

                    <div>
                        <h2>Show me what i have done</h2>

                        {this.state.content ? (
                        <IFrame 
                            src="https://semantic.dev.minus-data.no/pasientsky/?icpc-2="
                            title="semanticData"
                        >
                            <div dangerouslySetInnerHTML={{ __html: this.state.url }}></div>
                        </IFrame>
                        ) : (
                            <div>Nihuja</div>
                          )}
                    </div>

                    <div>
                    <IFrame 
                            src="https://semantic.dev.minus-data.no/pasientsky/?icpc-2="
                            title="semanticData"
                        >
                           
                        </IFrame>
                    </div>

                    
    
                </div>

        )
    }
}

export default Semantic;
