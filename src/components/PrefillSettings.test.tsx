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
    it("Shows the right amount of properties available to prefill", async () => {
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
                ],
                edges: [],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {},
                                "email": {},
                            },
                        }
                        
                    }
                ],
            }),
        });
        render(<GraphViewer />)

        const nodes = await screen.findAllByTestId("node");
        const button = within(nodes[0]).getByRole('button');
        await userEvent.click(button);

        const fields = await screen.queryAllByTestId("emptyField");
        
        expect(fields).toHaveLength(2);
       
    });
    it("keeps the values when re-opening the node prefill settings and hides the fields when toggle off", async() => {
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
                ],
                edges: [],
                forms: [
                    {
                        id: "f_01",
                        field_schema: {
                            type: "object",
                            properties: {
                                "multi_select": {},
                                "email": {},
                            },
                        }
                        
                    }
                ],
            }),
        });
        render(<GraphViewer />)

        let nodes = await screen.findAllByTestId("node");
        let button = within(nodes[0]).getByRole('button');
        await userEvent.click(button);

        let fields = await screen.queryAllByTestId("emptyField");
        expect(fields).toHaveLength(2);

        //toggle
        const toggle = await screen.getByTestId("activationToggle");
        await userEvent.click(toggle);

        //close
        const closeBtn = await screen.getByTestId("closeButton");
        await userEvent.click(closeBtn);

        //reopen
        nodes = await screen.findAllByTestId("node");
        button = within(nodes[0]).getByRole('button');
        await userEvent.click(button);

        fields = await screen.queryAllByTestId("emptyField");

        expect(fields).toHaveLength(0);
    });
});