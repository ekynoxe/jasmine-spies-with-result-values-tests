/*global jasmine:true, describe:true, afterEach:true, beforeEach:true, it:true, expect: true, spyOn:true, runs: true, waitsFor:true, spyOn:true, andCallThrough:true */
/*global foo:true, bar:true */

describe('testing FooBar', function () {
    var outputNodeClass = 'output',
        objectsToProcess = [
            { 'process': true, parts: ['I', 'will', 'be', 'joined']},
            { 'process': true, parts: ['This', 'is', 'a', 'test']},
            { 'process': false, parts: ['Ignore', 'me']},
            { 'process': true, parts: ['I', 'am', 'the', 'last', 'one!']}
        ],
        resultsNodes,
        i;

    function createOuputNode() {
        if (!document.getElementsByClassName(outputNodeClass).length) {
            var output = document.createElement("div");
            output.setAttribute("class", outputNodeClass);
            document.body.appendChild(output);
        }
    }

    beforeEach(function () {
        bar.init('output', objectsToProcess);
        createOuputNode();
    });

    afterEach(function () {
        resultsNodes = document.getElementsByClassName('result');
        
        runs(function () {
            while (resultsNodes.length) {
                resultsNodes[0].parentNode.removeChild(resultsNodes[0]);
                resultsNodes = document.getElementsByClassName('result');
            }
        });

        waitsFor(function () {
            return 0 === document.getElementsByClassName('result').length;
        });
    });

    /* foo tests */
    it('should process an object marked as to be processed with foo', function () {
        var res = foo.process(objectsToProcess[0]);
        expect(res).not.toBeFalsy();
        expect(res).toEqual('I will be joined');
    });

    it('should not process an object marked as to not be processed with foo', function () {
        expect(foo.process(objectsToProcess[2])).toBeFalsy();
    });

    it('should only contain objects that have been flagged to be processed with foo in the result', function () {
        expect(foo.processAll(objectsToProcess)).toEqual('I will be joined | This is a test | I am the last one!');
    });

    it('processAll should try and process all objects in the argument array with foo', function () {
        if (!jasmine.isSpy(foo.process)) {
            spyOn(foo, 'process');
        }
        foo.process.reset();

        foo.processAll(objectsToProcess);

        expect(foo.process).toHaveBeenCalled();
        expect(foo.process.callCount).toEqual(4);
    });


    /* bar tests */
    it('should have a foo member in bar', function () {
        expect(bar.foo).toBeDefined();
    });

    it('should call processAll on bar\'s foo when bar is started', function () {
        if (!jasmine.isSpy(bar.foo.processAll)) {
            spyOn(bar.foo, 'processAll');
        }
        bar.foo.processAll.reset();

        bar.start();

        expect(bar.foo.processAll).toHaveBeenCalled();
    });
    
    it('should print a result in the required node from bar', function () {
        var outputNodes;

        bar.result = 'Result string';
        bar.printResult();
        outputNodes = document.getElementsByClassName('result');
        expect(outputNodes.length).toBe(1);
        expect(outputNodes[0].innerHTML).toEqual(bar.result);
    });


    /* "integration" tests */
    it('should test that the results from the processing are as expected', function () {
        var originalBarFooProcess,
            returnValues = [];

        runs(function () {
            if (!jasmine.isSpy(bar.foo.process)) {
                originalBarFooProcess = bar.foo.process;
                spyOn(bar.foo, 'process').andCallFake(function () {
                    var res = originalBarFooProcess.apply(bar.foo, arguments);
                    returnValues.push(res);
                    return res;
                });
            }
            bar.foo.process.reset();

            bar.start();
        });

        waitsFor('foo.process to be called enough times', function () {
            return 4 <= bar.foo.process.callCount;
        }, 1000);

        runs(function () {
            // checking execution hasn't been halted and result is as expected
            resultsNodes = document.getElementsByClassName('result');
            expect(resultsNodes.length).toEqual(1);
            expect(resultsNodes[0].innerHTML).toEqual('I will be joined | This is a test | I am the last one!');

            // Testing intermediate return values
            expect(returnValues.length).toEqual(4);
            expect(returnValues[0]).toEqual('I will be joined');
            expect(returnValues[1]).toEqual('This is a test');
            expect(returnValues[2]).toBeFalsy();
            expect(returnValues[3]).toEqual('I am the last one!');
        });
    });
});