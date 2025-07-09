import React from "react"
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
import { GraphViewer } from '../pages/GraphViewer';
import { PrefillSettings } from './PrefillSettings' 
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";


describe('GraphViewer', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        cleanup();
        sessionStorage.clear();
        vi.resetAllMocks();
    });
    it("Shows only the nodes available to the node selected", async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            json: async() => ({
                nodes: [
                    {
                        id: '1',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form A',
                            id: "node1",
                            component_id: "f_01",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '2',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form C',
                            id: "node2",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '3',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form D',
                            id: "node3",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                ],
                edges: [
                    {
                        source: "1",
                        target: "2"
                    },
                    {
                        source: "1",
                        target: "3"
                    },
                ],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {type: "array"},
                                "email": {type: "string"},
                            },
                        },
                    },
                    {
                        id: "f_02",
                        field_schema: {
                            type: "object",
                            properties: {
                                "dynamic_checkbox_group": {type:"array"},
                                "email": {type: "string"},
                                "id": {type: "string"},
                                "name": {type: "string"},
                            },
                        },
                    },
                ],
            }),
        });
        render(<GraphViewer />)

        //select node
        const nodes = await screen.findAllByTestId("node");
        const button = within(nodes[1]).getByRole('button');
        await userEvent.click(button);

        //select a field
        const field = await screen.getByText("dynamic_checkbox_group");
        await userEvent.click(field);

        const forms = await screen.getAllByTestId("formButton");
        
        expect(forms).toHaveLength(2);
    });
    it("Shows all the fields", async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            json: async() => ({
                nodes: [
                    {
                        id: '1',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form A',
                            id: "node1",
                            component_id: "f_01",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '2',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form C',
                            id: "node2",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '3',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form D',
                            id: "node3",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                ],
                edges: [
                    {
                        source: "1",
                        target: "2"
                    },
                    {
                        source: "1",
                        target: "3"
                    },
                ],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {type: "array"},
                                "email": {type: "string"},
                            },
                        },
                    },
                    {
                        id: "f_02",
                        field_schema: {
                            type: "object",
                            properties: {
                                "dynamic_checkbox_group": {type:"array"},
                                "email": {type: "string"},
                                "id": {type: "string"},
                                "name": {type: "string"},
                            },
                        },
                    },
                ],
            }),
        });
        render(<GraphViewer />)

        //select node
        const nodes = await screen.findAllByTestId("node");
        const button = within(nodes[1]).getByRole('button');
        await userEvent.click(button);

        //select a field
        const field = await screen.getByText("dynamic_checkbox_group");
        await userEvent.click(field);

        //open the other form's field (the current one starts selected)
        const forms = await screen.getAllByTestId("formButton");
        expect(forms).toHaveLength(2);
        await userEvent.click(forms[0]);

        //get all the fields
        const totalFields = await screen.getAllByTestId("mappingFieldButton");

        expect(totalFields).toHaveLength(6); //form C has 4 fields, form A has 2 fields
    });

    it("only accepts to prefill fields of the same data type", async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            json: async() => ({
                nodes: [
                    {
                        id: '1',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form A',
                            id: "node1",
                            component_id: "f_01",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '2',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form C',
                            id: "node2",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                    {
                        id: '3',
                        position: {x: 120, y: 10},
                        type: 'form',
                        data: {
                            name: 'Form D',
                            id: "node3",
                            component_id: "f_02",
                            component_type: 'form',
                        },
                    },
                ],
                edges: [
                    {
                        source: "1",
                        target: "2"
                    },
                    {
                        source: "1",
                        target: "3"
                    },
                ],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {type: "array"},
                                "email": {type: "string"},
                            },
                        },
                    },
                    {
                        id: "f_02",
                        field_schema: {
                            type: "object",
                            properties: {
                                "dynamic_checkbox_group": {type:"array"},
                                "email": {type: "string"},
                                "id": {type: "string"},
                                "name": {type: "string"},
                            },
                        },
                    },
                ],
            }),
        });
        render(<GraphViewer />)

        //select node
        const nodes = await screen.findAllByTestId("node");
        const button = within(nodes[1]).getByRole('button');
        await userEvent.click(button);

        //select a field
        const field = await screen.getByText("dynamic_checkbox_group");
        await userEvent.click(field);

        //open the other form's field (the current one starts selected)
        const forms = await screen.getAllByTestId("formButton");
        expect(forms).toHaveLength(2);
        await userEvent.click(forms[0]);

        //select an invalid field (different data type)
        let totalFields = await screen.getAllByTestId("mappingFieldButton");
        await userEvent.click(totalFields[1]);

        //press confirm button
        const confirmBtn = await screen.getByTestId("confirmButton");
        await userEvent.click(confirmBtn);

        //expect to stay on the same menu
        totalFields = await screen.queryAllByTestId("mappingFieldButton");
        expect(totalFields).toHaveLength(6);

        //select valid field and confirm
        await userEvent.click(totalFields[0]);
        await userEvent.click(confirmBtn);
        totalFields = await screen.queryAllByTestId("mappingFieldButton");

        expect(totalFields).toHaveLength(0); //meaning closed menu
    });
});