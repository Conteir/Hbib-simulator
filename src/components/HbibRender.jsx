import React from "react";

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

    // let dataForXAsJson = this.props.hbibData;


    // console.log("what is inside xAsJson? ", data?.data?.guillotine?.query.xAsJson._id);

    return (
      <div>
            <div>
                {Array.isArray(data?.data?.guillotine?.query) ? data.data.guillotine.query.map((item, index) => {
                    console.log(item);
                    return (
                        <div key={index}>
                            <p><b>DATA FROM dataAsJson</b></p>
                            <div dangerouslySetInnerHTML={{ __html: item.dataAsJson.activeIngredient }}></div>
                            <b><div dangerouslySetInnerHTML={{ __html: item.dataAsJson.title }}></div></b>
                            <div dangerouslySetInnerHTML={{ __html: item.dataAsJson.text }}></div>

                            <p><b>DATA FROM xAsJson</b></p>
                            <div>{item.xAsJson._id}</div>
                        </div>
                    );
                }) : null}
            </div>

            {/* <div>
                {Array.isArray(dataForXAsJson?.data?.guillotine?.query) ? dataForXAsJson.data.guillotine.query.map((item, index) => {
                    console.log(item);
                    return (
                        <div key={index}>
                            <p><b>DATA FROM xAsJson</b></p>
                            <div>{item.xAsJson}</div>
                        </div>
                    );
                }) : null}
            </div> */}
            
            
      </div>
    );
  }

};

export default HbibRender;