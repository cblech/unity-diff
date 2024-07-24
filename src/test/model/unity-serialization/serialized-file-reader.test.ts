import * as assert from 'assert';
import * as vscode from 'vscode';

// import the SerializedFileReader class
import SerializedUnityFileReader from '../../../model/unity-serialization/serialized-file-reader';

suite('Serialized File Reader Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let testDataPath = __dirname + '/test-data';

	test('Deserialization Test', async () => {
		let reader = new SerializedUnityFileReader(vscode.Uri.file(testDataPath + '/DefaultScene.unity') );
		let file = reader.read();

		assert.notEqual(file, null);
	});

	test('Parenting scene hierarchy test', async () => {
		let reader = new SerializedUnityFileReader(vscode.Uri.file(testDataPath + '/ParentingScene.unity'));
		let file = await reader.read();

		assert.notEqual(file, null);
		assert.notEqual(file.hierarchy, null);

		// hierarchy format:
		/*
		{
		  "ParentingScene": {
		    "root 1": {},
		    "root 2": {
		      "Child 2 - 1": {
		        "Child 2 - 1 - 1": {}
		      },
		      "Child 2 - 2": {}
		    },
		    "root 3": {},
		    "root 4": {
		      "Child 4 - 1": {}
		    }
		  }
		}
		*/

		assert.equal(file.hierarchy.rootGameObjects.length, 4);

		assert.equal(file.hierarchy.rootGameObjects[0].getName(), "root 1");
		assert.equal(file.hierarchy.rootGameObjects[1].getName(), "root 2");
		assert.equal(file.hierarchy.rootGameObjects[2].getName(), "root 3");
		assert.equal(file.hierarchy.rootGameObjects[3].getName(), "root 4");

		assert.equal(file.hierarchy.rootGameObjects[0].children.length, 0);
		assert.equal(file.hierarchy.rootGameObjects[1].children.length, 2);
		assert.equal(file.hierarchy.rootGameObjects[2].children.length, 0);
		assert.equal(file.hierarchy.rootGameObjects[3].children.length, 1);

		assert.equal(file.hierarchy.rootGameObjects[1].children[0].getName(), "Child 2 - 1");
		assert.equal(file.hierarchy.rootGameObjects[1].children[1].getName(), "Child 2 - 2");
		assert.equal(file.hierarchy.rootGameObjects[3].children[0].getName(), "Child 4 - 1");

		assert.equal(file.hierarchy.rootGameObjects[1].children[0].children.length, 1);
		assert.equal(file.hierarchy.rootGameObjects[1].children[1].children.length, 0);
		assert.equal(file.hierarchy.rootGameObjects[3].children[0].children.length, 0);

		assert.equal(file.hierarchy.rootGameObjects[1].children[0].children[0].getName(), "Child 2 - 1 - 1");
	});

	test('Parenting scene hierarchy test without SceneRoots', async () => {
		let reader = new SerializedUnityFileReader(vscode.Uri.file(testDataPath + '/ParentingSceneWithoutSceneRoots.unity'));
		let file = await reader.read();

		assert.notEqual(file, null);
		assert.notEqual(file.hierarchy, null);

		// hierarchy format:
		/*
		{
		  "ParentingScene": {
		    "root 3": {},
		    "root 2": {
		      "Child 2 - 1": {
		        "Child 2 - 1 - 1": {}
		      },
		      "Child 2 - 2": {}
		    },
		    "root 4": {
		      "Child 4 - 1": {}
		    },
		    "root 1": {}
		  }
		}
		*/

		assert.equal(file.hierarchy.rootGameObjects.length, 4);

		assert.equal(file.hierarchy.rootGameObjects[0].getName(), "root 3");
		assert.equal(file.hierarchy.rootGameObjects[1].getName(), "root 2");
		assert.equal(file.hierarchy.rootGameObjects[2].getName(), "root 4");
		assert.equal(file.hierarchy.rootGameObjects[3].getName(), "root 1");

		assert.equal(file.hierarchy.rootGameObjects[0].children.length, 0);
		assert.equal(file.hierarchy.rootGameObjects[1].children.length, 2);
		assert.equal(file.hierarchy.rootGameObjects[2].children.length, 1);
		assert.equal(file.hierarchy.rootGameObjects[3].children.length, 0);

		assert.equal(file.hierarchy.rootGameObjects[1].children[0].getName(), "Child 2 - 1");
		assert.equal(file.hierarchy.rootGameObjects[1].children[1].getName(), "Child 2 - 2");
		assert.equal(file.hierarchy.rootGameObjects[2].children[0].getName(), "Child 4 - 1");
		
		assert.equal(file.hierarchy.rootGameObjects[1].children[0].children.length, 1);
		assert.equal(file.hierarchy.rootGameObjects[1].children[1].children.length, 0);
		assert.equal(file.hierarchy.rootGameObjects[2].children[0].children.length, 0);

		assert.equal(file.hierarchy.rootGameObjects[1].children[0].children[0].getName(), "Child 2 - 1 - 1");
	});
});
