import React from "react";
import {
  CollapsibleComponent,
  CollapsibleHead,
  CollapsibleContent,
} from "react-collapsible-component";
import "../index.css";

export const HbibRender = class HbibRender extends React.Component {
  render() {
    return (
      <div>
        <div>{this.renderJson()}</div>
      </div>
    );
  }

  renderJson() {
    console.log("HBibRendering: ", this.props.hbibData);

    if(!this.props.hbibData) return <></>;
    let data = JSON.parse(this.props.hbibData);

    return (
      <div>
        <CollapsibleComponent className="Collapsible__trigger">
            <div>
              {
                Array.isArray(data?.data?.guillotine?.query) ? data.data.guillotine.query.map((item, index) => {
                  return (
                    
                    <div key={index}>
                      {/* <p><b>DATA FROM dataAsJson</b></p> */}
                      {/* <div dangerouslySetInnerHTML={{ __html: item.dataAsJson.activeIngredient }}></div> */}
                      <div className="Collapsible__trigger">
                      <CollapsibleHead>
                        <b><div dangerouslySetInnerHTML={{ __html: item.dataAsJson.title }}></div></b>
                      </CollapsibleHead>
                      <CollapsibleContent>
                        {/* <b><div className="form-group" dangerouslySetInnerHTML={{ __html: item.dataAsJson.title }}></div></b> */}
                        <div className="form-group" dangerouslySetInnerHTML={{ __html: item.dataAsJson.text }}></div>
                      </CollapsibleContent>
                      </div>
                          
                      {/* <div>{item.xAsJson['no-seeds-hbib'].metadata['editorial-owner']}</div> */}
                      {/* <div>
                        {
                          item?.xAsJson ? 
                            item.xAsJson['no-seeds-hbib'].metadata.code.map((item, index) => {
                              return (
                                <div key={index}>
                                  {"code: " + item}
                                </div>
                              );
                            })
                          : null
                        }
                      </div> */}
          
                    </div>
                      
                  );
                })
                : null
              }
            </div>
        </CollapsibleComponent>
      </div>
    );
  }
};

export default HbibRender;