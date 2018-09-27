const { Pact } = require('@pact-foundation/pact');
const { expect } = require('chai');
const path = require('path');
const fetch = require('node-fetch');


const MOCK_SERVER_PORT = 2202;


class TodoApp {

    constructor(port = MOCK_SERVER_PORT) {
        this.port = port;
    }

    async getProjects() {
        const response = await fetch(`http://localhost:${this.port}/projects`, {
            headers: {
                Accept: "application/json"
            }
        });
        return await response.json();
    }
}

describe('test', () => {

    const provider = new Pact({
        consumer: "TodoApp",
        provider: "TodoService",
        port: MOCK_SERVER_PORT,
        log: path.resolve(process.cwd(), "logs", "pact.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "WARN",
        spec: 2
    });
    const EXPECTED_BODY = [
        {
            id: 1,
            name: "Project 1",
            due: "2016-02-11T09:46:56.023Z",
            tasks: [
                { id: 1, name: "Do the laundry", done: true },
                { id: 2, name: "Do the dishes", done: false },
                { id: 3, name: "Do the backyard", done: false },
                { id: 4, name: "Do nothing", done: false }
            ]
        }
    ];

    context('when there is a list of project', () => {
        before(async () => {
            await provider.setup();
            provider.addInteraction({
                // The 'state' field specifies a "Provider State"
                state: "i have a list of projects",
                uponReceiving: "a request for projects",
                withRequest: {
                    method: "GET",
                    path: "/projects",
                    headers: { Accept: "application/json" }
                },
                willRespondWith: {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: EXPECTED_BODY
                }
            });
        });
        it("should generate a list of TODOs for the main screen", async () => {
            const todoApp = new TodoApp();
            const projects = await todoApp.getProjects()
            expect(projects).to.be.a("array");
        });

        afterEach(() => provider.verify());

        after(() => provider.finalize());
    });
});