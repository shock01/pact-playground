const path = require('path');
const chai = require('chai');
const { Verifier } = require('@pact-foundation/pact');
const express = require('express');
const http = require('http');

describe('testing the provider', () => {
    context('test', () => {
        let server;
        before(() => {
            // create new server
            app = express();
            server = http.createServer(app).listen();
            app.set('port', server.address().port);
            app.get('/projects', (req, res, next) => {
                res.json([{
                    id: 1,
                    name: "Project 1",
                    due: "2016-02-11T09:46:56.023Z",
                    tasks: []
                }]);
                next();
            });
        });
        it('should verify the pacts', async () => {
            await new Verifier().verifyProvider({
                providerBaseUrl: 'http://localhost:' + server.address().port,
                provider: 'test',
                pactUrls: [path.resolve(process.cwd(), 'pacts', 'todoapp-todoservice.json')]
            });
        });
        after(() => {
            server.close();
        });
    });
});