Performance = {

    capture : false,

    eventNames : [],

    data : {},

    setCapture : function(capture) {
        Performance.capture = capture
        console.log(`performance.js capture ${capture ? "*on*" : "*off*"}` )
    },

    mark : function(processKey, eventName) {

        var processName, processInfo, cell

        if (!Performance.capture) {
            return
        }

        if (!_.contains(Performance.eventNames, eventName)) {
            Performance.eventNames.push(eventName)
        }

        processName = processKey.toString()

        processInfo = Performance.data[processName]
        if (!processInfo) {
            processInfo = { processKey: processKey, row: {} }
            Performance.data[processName] = processInfo
        }

        cell = processInfo.row[eventName]
        if (!cell) {
            cell = { invocationCount: 0 }
            processInfo.row[eventName] = cell
        }

        cell.invocationCount++
        cell.date = new Date()
    },

    dump : function() {

        var processArray, output

        console.log("performance.js *dump*")

        processArray = _.map(Performance.data, function(processInfo) {
            return processInfo
        })

        processArray.sort(function(processInfoA, processInfoB) {

            if (processInfoA.processKey < processInfoB.processKey) return -1
            if (processInfoA.processKey > processInfoB.processKey) return +1

            return 0
        })

        output = Performance.pad("", 25)

        Performance.eventNames.forEach(function(eventName, index) {
            output += Performance.pad(eventName, index === 0 ? 20 : 10)
        })

        console.log(output)

        processArray.forEach(function(processInfo) {

            var output, cellPrior

            cellPrior = null

            output = Performance.pad(processInfo.processKey.toString(), 25)

            Performance.eventNames.forEach(function(eventName, index) {

                var cell, milliseconds, padSize

                cell = processInfo.row[eventName]

                padSize = index === 0 ? 20 : 10

                if (cell) {
                    if (index === 0) {
                        output += Performance.pad(Util.formatTime(cell.date, true) + "(" + cell.invocationCount + ")", padSize)
                    }
                    else {
                        milliseconds = cellPrior ? cell.date.getTime() - cellPrior.date.getTime() : -1
                        output += Performance.pad(milliseconds + "(" + cell.invocationCount + ")", padSize)
                    }
                    cellPrior = cell
                }
                else {
                    output += Performance.pad("", padSize)
                }
            })

            console.log(output)
        })
    },

    clear : function() {
        Performance.eventNames = []
        Performance.data = {}
        console.log("performance.js *cleared*")
    },

    pad : function(input, size) {
        return input + "                              ".substr(0, size - input.length)
    }
}
