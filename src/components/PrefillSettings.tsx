import { useState, useEffect, createContext, useContext } from 'react';
import { MappingMenu } from './MappingMenu.tsx';
import { infoContext } from '../pages/GraphViewer.tsx';
import type { NodeObject } from './GraphNode.tsx';
import type { Property } from './MappingMenu.tsx';
import styles from './PrefillSettings.module.css';

type PrefillSettingsProps = {
    nodeObj : NodeObject,
    onClose : () => void,
}

type FieldInfo = {
    name : string,
    isActivated : boolean,
    fields : {[key: string] : string},
}

//create context for accessing addFieldSource() function to add a selected reference to another form
export const prefillContext = createContext<(fs: {propertyName:string; source:string}) => void>(() => {});

export function PrefillSettings({nodeObj, onClose} : PrefillSettingsProps) {
    const info = useContext(infoContext);

    //the prefill information of the node
    const [prefillInfo, setPrefillInfo] = useState<{[key : string]: FieldInfo}>(() => {
        const stored = localStorage.getItem('prefillInfo');
        return stored ? JSON.parse(stored) : {};
    });
    const [showMapMenu, setShowMapMenu] = useState(false);

    //property selection to modify in Mapping Menu
    const [selection, setSelection] = useState("");

    //initialize or update prefillInfo whenever we open the menu
    useEffect(() => {
        let found = false;
        //check if exists
        if (prefillInfo){
            if (nodeObj.data.name in prefillInfo) {
                found = true;
            }
        }
        //register FieldInfo if new
        if (!found) {
            const totalFields = GetFormProperties(nodeObj.data.component_id);
            let fieldsObj = {};
            Object.keys(totalFields).forEach((f) => {
                fieldsObj = {...fieldsObj, [f]: ""};
            })

            const newFieldInfo : FieldInfo = {
                name: nodeObj.data.name,
                isActivated: true,
                fields: {
                    ...fieldsObj
                }
            }
            setPrefillInfo(prev => ({...prev, [nodeObj.data.name]: newFieldInfo}));
        }
    }, [nodeObj])

    //update session storage of prefillInfo
    useEffect(() => {
        localStorage.setItem('prefillInfo', JSON.stringify(prefillInfo));
    }, [prefillInfo])

    const closeMappingMenu = () => {
        setShowMapMenu(false);
        setSelection("");
    }

    //get the properties to modify
    const GetFormProperties = (id : string) : { [propertyName: string]: Property } => {
        for (let i = 0; i < info.forms.length; i++) {
            if (info.forms[i].id === id) {
                console.log(info.forms[i].field_schema.properties);
                return info.forms[i].field_schema.properties;
            }
        } 
        return {}  
    }

    //add a reference from another Form's field
    const addFieldSource = (fs : {propertyName:string; source:string}) => {
        setPrefillInfo(prev => {
            const current = prev[nodeObj.data.name];
            if (!current) return prev;

            return {
                ...prev,
                [nodeObj.data.name]: {
                    ...current,
                    fields: {
                        ...current.fields,
                        [fs.propertyName]: fs.source,
                    },       
                },
            };
        });
        ;
    }

    //remove an existing reference
    const removeFieldSource = (f : string) => {
        setPrefillInfo(prev => {
            const current = prev[nodeObj.data.name];
            let newFields = {};

            if (!current) return prev;

            Object.keys(current.fields).forEach((field) => {
                if (field != f) {
                    newFields = {...newFields, [field]: current.fields[field]};
                }
                else {
                    newFields = {
                        ...newFields,
                        [field]: ""
                    }
                }
            })
            return {
                ...prev,
                [nodeObj.data.name]: {
                    ...current,
                    fields: {
                        ...newFields
                    }
                }
            }
        })
    }

    //toggle use of prefilled fields
    const toggleActivated = (e : boolean) => {
        const current = prefillInfo[nodeObj.data.name];
        setPrefillInfo((prev) => ({...prev, [nodeObj.data.name] : {...current, isActivated: e}}))
    }

   //debugging functions
    const clearPrefillInfo = () => {
    setPrefillInfo({});
    onClose();
   }
    const clearPrefillInfoStorage= () => {
        localStorage.setItem('prefillInfo', JSON.stringify({}));
    }



    const prefillSection = (
        <>
            <div className={styles.prefillSettings__title} data-testid={"prefillSettingsTitle"}>
                <h4 style={{fontFamily:'Arial, Helvetica, sans-serif', margin: '0px'}}>Prefill</h4>
            </div>
            <div className={styles.prefillSettings__prefillToggle}>
                <h6 style={{fontFamily:'Arial, Helvetica, sans-serif', margin: '0px'}}>Prefill fields for this form</h6>
                <label className={styles.prefillSettings__switch}>
                    <input 
                        data-testid={"activationToggle"}
                        checked={prefillInfo[nodeObj.data.name]?.isActivated} 
                        onChange={(e) => {toggleActivated(e.target.checked)}} 
                        type="checkbox" 
                        id="toggleSwitch"
                        ></input>
                    <span className={styles.prefillSettings__slider}></span>
                </label>
            </div>
            
            <div className={styles.prefillSettings__middle}>
                {prefillInfo[nodeObj.data.name]?.isActivated ? (
                    prefillInfo[nodeObj.data.name] && 
                    Object.keys(prefillInfo[nodeObj.data.name].fields).map((field, index) => {
                        const f = prefillInfo[nodeObj.data.name].fields[field];
                        if (f && f !== ""){
                            return (
                                <div key={index} className={styles.prefillSettings__filledField}>
                                    <div 
                                        style={{
                                            display:'flex', 
                                            alignItems:'center', 
                                            width:'100%', 
                                            paddingLeft: '9px', 
                                            fontSize: '12px', 
                                            fontWeight:'bold'
                                        }}
                                    >
                                        {f}.{field}
                                    </div>
                                    <button 
                                        className={styles.prefillSettings__xButton} 
                                        onClick={() => removeFieldSource(field)}
                                    >
                                        x
                                    </button>
                                </div>
                            );
                        }
                        else {
                            return (
                                <button 
                                    data-testid={"emptyField"}
                                    className={styles.prefillSettings__field} 
                                    key={index} 
                                    onClick={() => {setShowMapMenu(true);setSelection(field);}}
                                >
                                    {field}
                                </button>
                            )
                        }
                    })
                ) : null}
            </div>
            <div className={styles.prefillSettings__footer}>
                {/*debug*/0 ? <button onClick={() => clearPrefillInfo()}>Clear PrefillInfo (debug)</button>: <></>}
                <button data-testid={"closeButton"} className={styles.prefillSettings__back} onClick={() => onClose()}>
                    Close
                </button>
            </div>
        </>
    );

   return (
        <prefillContext.Provider value = {addFieldSource}>
            <div className={styles.prefillSettings__backdrop}>
                <div className={styles.prefillSettings__container} >
                    {showMapMenu === true ? 
                        <MappingMenu 
                            nodeObj={nodeObj} 
                            property={selection} 
                            onClose={() => {closeMappingMenu()}} 
                        /> : prefillSection}
                </div>
            </div>
        </prefillContext.Provider>
   );
};