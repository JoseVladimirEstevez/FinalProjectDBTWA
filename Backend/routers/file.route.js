const express = require('express');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const path = require('path');
const { spawn } = require('child_process');
const { client } = require('../database/database.js');
const { cursorTo } = require('readline');
const { ObjectId } = require('mongodb');
const fs = require('fs');

const router = express.Router();

const database = client.db('finalproject');
const userCollection = database.collection('users');
const graphCollection = database.collection('graphs');

router.get('/', (req, res) => {
    res.status(200).send({
        message: 'File route is working.',
    });
});

router.post('/file', async (req, res) => {
    try {
        const { countries, graphType } = req.body;
        console.log('Received request:', { countries, graphType });

        // Get absolute paths
        const pythonScriptPath = path.resolve(__dirname, '../../Database/generate_graph.py');
        const workingDirectory = path.resolve(__dirname, '../../Database');

        // Format countries array into a comma-separated string without brackets
        const countriesStr = Array.isArray(countries) 
            ? countries.map(country => country.trim()).join(',')
            : countries;

        console.log('Formatted countries string:', countriesStr);

        const pythonProcess = spawn('python', [
            pythonScriptPath,
            countriesStr,
            graphType
        ], {
            cwd: workingDirectory  // Set working directory to where the CSV file is
        });

        // Debug Python process
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });

        // Wait for Python process to complete
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Python process exited with code ${code}`));
            });
        });

        // Check if file exists
        const filePath = path.join(__dirname, `../../Database/Pictures/${graphType}.png`);
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).json({ 
                error: 'Graph generation failed',
                details: 'Image file not found'
            });
        }

        // Send file
        res.sendFile(filePath);

    } catch (error) {
        console.error('Error in /file route:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.post('/save', async (req, res) => {
	const token = req.headers.authorization;
	const body = req.body;

	const decodedToken = jwt_decode(token);

	const userId = decodedToken.userId;
	
	const result = await graphCollection.insertOne({
		userId: userId,
        name: body.name,
        countries: body.countries,
        graphType: body.graphType,
		date: body.date
    });

	res.status(201).send({
        message: 'Success.'
    });
});

router.post('/graphs', async (req, res) => {
	user_id = req.query.user_id;

	cursor = graphCollection.find({userId: user_id});

	const documents = await cursor.toArray();

	res.status(200).send({
		message: 'Success.',
		documents
	});
});

router.delete('/delete', async (req, res) => {
	const graphId = req.query.graph_id;
	
	const result = await graphCollection.deleteOne({'_id': new ObjectId(graphId)});

	if (result.deletedCount === 1) {
		res.status(200).send({
			message: 'Success.',
			result
		});
	} else {
		res.status(404).send({
			message: 'Failed.',
			result
		});
	}
});

module.exports = router;