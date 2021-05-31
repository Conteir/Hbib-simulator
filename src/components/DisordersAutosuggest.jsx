import React from 'react';
import Autosuggest from 'react-autosuggest';
import { snomedURLs, codeSystemEnv } from '../config.ts';
import './DisordersAutoSuggest.css';

export default class DisordersAutosuggest extends React.Component {
  constructor() {
    super();

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      value: '',
      suggestions: []
    };
  }
  
  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
    getSuggestionValue = (suggestion) => {
      this.props.suggestCallback(suggestion);

      return suggestion.term + ' (SCTID: ' + suggestion.concept.conceptId
        + ', ' + suggestion?.$codeSystemResult?.codeSystem
        + ': ' + suggestion?.$codeSystemResult?.code + ')';
    }
  
  // Use your imagination to render suggestions.
    renderSuggestion = (suggestion) => (
    <div>
      {/** taking from hdir descriptions */}
      {suggestion.term + ' (SCTID: ' + suggestion.concept.conceptId // items.concept.conceptId
          + ', ' + suggestion?.$codeSystemResult?.codeSystem
          + ': ' + suggestion?.$codeSystemResult?.code + ')'}
    </div>
  );

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    const inputValue = value.trim().toLowerCase();

    //snomedURLs.getTerms = URLaddress; value = a term from users input
    if( inputValue && inputValue.length >= 3) {
        // First request to Snomed: search by term
        fetch(snomedURLs.getTerms + value,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        )
        .then(response => response.json())
        .then(data => {
          // check if input is still the same after fetch (fetch takes time)
          if(this.state.value.trim().toLowerCase() === inputValue && Array.isArray(data.items)) {
            console.log("Snomed Search by term: " + inputValue + ":", data);
            let items = []; // for suggestions
            let promises = []; // promises with code system

            // let setEnviroments = enviroments.find(o => o.id === enviroment);
            const selectedCodeSystem = codeSystemEnv.find(o => o.id === this.props.codeSystem); // using codeSystem prop from Record

            //for eavh suggestion
            data.items.forEach(el => {
              const conceptId = el.concept.conceptId;

              if(selectedCodeSystem) {
                
                // send request to get code in the selected code system
                // selectedCodeSystem contains one object from codeSystemEnv list in config.ts
                let codeSystemPromise = fetch(selectedCodeSystem.url + conceptId)
                .then((response) => response.json())
                .then((data) => {
                  console.log("Code system: " + selectedCodeSystem.id, data);
                  // Check if array is not empty (means that there is no info for this term, probably its children have)
                  if (data && Array.isArray(data.items) && data.items.length > 0) { //check if object is not empty
                    // check that code exests (for any reason?)
                    if (data.items[0]?.additionalFields?.mapTarget) {
                      // create and fill $codeSystemResult object on each of 10 items in Snomed term search result
                      el.$codeSystemResult = {
                        codeSystem: selectedCodeSystem.id,
                        code: data.items[0]?.additionalFields?.mapTarget || 'None'
                      }
                    }
                  }
                });

                promises.push(codeSystemPromise);
              }
              
              items.push(el);
            });
            
            Promise.all(promises).then(() => {
              // Need to be sure that entered word is the word in the current function call
              if(this.state.value.trim().toLowerCase() === inputValue) {
                // set filled items as suggestions
                this.setState({
                    suggestions: items
                });
              }
            });
            
          }
        });
    } else {
        this.setState({
            suggestions: []
        });
    }
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onChange = (event, { newValue }) => {
    //this.props.clearCallback();
    this.setState({
      value: newValue
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
        <div>
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps}
            />
        </div>
    );
  }
}

