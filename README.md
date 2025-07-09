# Avantos React coding challenge

How to run locally:
1. Clone the provided API: https://github.com/Eric-Oyervides/frontendchallengeserver
   
2. Clone this repository in another folder
 
3. In the folder of the API, run:

```bash
npm start
```
It should start running on port: 3000


4. In the folder of this repository, run:

```bash
npm install
```
To install the packages


5. If the API cannot run on port 3000, the port can be specified in "forms-management-system/src/pages/GraphViewer.tsx"


6. To run the tests, run: 

```bash
npm test
```
Every test should appear as "passed"


7.To run the project:
```bash
npm run dev
```

## Specifications
This project is designed to work with the structure given by the API and Avantos Core API Reference (https://admin-ui.dev-sandbox.workload.avantos-ai.net/docs#/operations/action-blueprint-graph-get). The full information is fetched at the start and used throughout the program. Each node can be of several types, in the scope of this project, it can only be of type "form". And each node can be attached to another one, giving it access to its information. 

This tools makes sure to read all the nodes given and read their name (nodes.data.name) and position (nodes.position), and show it on screen. This program shows the nodes and makes it possible to drag them to any position.

When a node is clicked, the selected node's "Prefill Settings" are shown, where you can select which fields from the form to prefill from another form. All these fields are dynamic and can change if the information is different across different forms. The fields/properties are read from forms[index].field_schema.properties and connected to the node via nodes.data.component_id === forms[index].id

After an empty field is selected, you accesss the "MappingMenu", where all the parameters that the current node can access. This information is given in edges[index] where there's a source and a target, where the target is the child node. With that, we have the connections needed to see the hierarchy and show the "Node Family". In the MappingMenu, you see the different forms (in hierarchical level) and click to expand to see their fields. In the right side of the menu, when you hover on a field, you see the description of the field on the right. In this description it's specified the data type and if it's compatible. If it's the same data type, it's considered to be compatible and when you select it, ut enables you to confirm the selection.

With the selection made, you go back to the "PrefillSettings" and see that the connection was made, the field shows now the parameter that will prefill the field (e.g. Form A.email). You can click the 'x' button to cancel the selection and it changes to an empty field again.




