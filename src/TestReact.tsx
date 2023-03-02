import * as React from "react";
import { useRef, useEffect } from "react";

const TestReact = (props:any) => {
    const {val, host, basicFilter, merge, nodeT } = props;
    const ref = useRef({});
    useEffect(() => {
        nodeT(ref.current);
    }, []);
    const handleClick = (e) => {
        const value = e.target.value;
        if(value === "All") {
            host.applyJsonFilter(basicFilter, 'general', 'filter',  powerbi.FilterAction.remove);
            
        } else {
            basicFilter.values = [value];
            host.applyJsonFilter(basicFilter, 'general', 'filter',  powerbi.FilterAction.merge);
        }       

    }
    return (<div ref= {(r) => ref.current = r } >
    <p>test Font Size</p>
    <button value="All" key={0} onClick={handleClick} >All</button>
    {val.map((item,i) => <button id={i} key={i} value={item} onClick={handleClick}>{item}</button>)}
    </div>)
}

export default TestReact;