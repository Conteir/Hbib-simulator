import React from 'react';
import Autosuggest from 'react-autosuggest';
import { snomedURLs } from '../config.ts';
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
        this.props.suggestCallback(suggestion.concept.conceptId);
        return suggestion.term + ' (' + suggestion.concept.conceptId + ')';
    }
  
  // Use your imagination to render suggestions.
    renderSuggestion = (suggestion) => (
    <div>
      {suggestion.term + ' (' + suggestion.concept.conceptId + ')'}
    </div>
  );

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    const inputValue = value.trim().toLowerCase();

    //snomedURLs.getTerms = address
    //value = users input
    if( inputValue && inputValue.length >= 3 && value == inputValue ) {
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
            if(Array.isArray(data.items)) {
                let items = [];

                data.items.forEach(el => {
                    if(el.term && el.term.length > 0) items.push(el);
                });
                
                // Need to be sure that entered word is the word in the current function call
                if(this.state.value.trim().toLowerCase() === inputValue.trim().toLowerCase()) {
                    this.setState({
                        suggestions: items
                    });
                }
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

