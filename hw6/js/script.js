words = d3.json('./data/words.json');

Promise.all([d3.csv('./data/words-without-force-positions.csv'), words]).then( data =>
    {
        //rolledPollData = new Map(pollData); //  convert to a Map object for consistency with d3.rollup
        let table = new Table(data[1]);
        let bubblechart = new Bubble(data[1]);
    });//background: #88b6f7;