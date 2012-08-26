var foo = {
    processAll: function (objects) {
        var i,
            res,
            results = [];

        for (i = 0; i < objects.length; i++) {
            res = foo.process(objects[i]);
            if (res) {
                results.push(res);
            }
        }

        return results.join(' | ');
    },

    process: function (args) {
        // Here is the 'filtering', if args.process is false, the function returns false
        if (!args.process) {
            return false;
        }
        
        return args.parts.join(' ');
    }
};

var bar = {
    foo: foo,
    objects: [],
    results: [],
    node: null,

    init: function (nodeClass, objects) {
        bar.objects = objects;

        var nodes = document.getElementsByClassName(nodeClass);
        if (nodes.length) {
            bar.node = nodes[0];
        }
    },

    start: function () {
        bar.result = bar.foo.processAll(bar.objects);
        bar.printResult();
        
        delete bar.node;
    },

    printResult: function () {
        var obj,
            i;

        if (!bar.node) {
            return;
        }

        obj = document.createElement("div");
        obj.innerHTML = bar.result;
        obj.setAttribute("class", "result");
        bar.node.appendChild(obj);
    }
};