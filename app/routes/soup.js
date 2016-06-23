/*global Ember */
Array.prototype.count = function(element){
    return this.filter(function(arrayElement){
        return element === arrayElement;
    }).length;
};

Array.prototype.consecutiveElement = function(){
    const text = this.reduce(function(a,b){
        return a + b;
    });
    var t = text.match(/(_)\1*/g);
    const positions = t.map(function(cell){
        return {'len' : cell.length, 'start' : text.indexOf(cell)};
    });
    return positions;
};


export var words;

function resolveWord(data){
  words = data.words;
  return {words:data,soup:letterSoup(data,10)};
}

function getWord (resolve){
  console.log('getWord');
  Ember.$.ajax({
    data: {
        'nwords': 5,
        'maxlength': 10
    },
    url: 'http://localhost:3000/word',
    type: 'GET',
    success: function(data){
      console.log('OK',data);
      resolve(data);
    },
    error: function(data){
      console.log('ERROR',data);
      return;
    }
  });
}


const matrixFunctions = (function(){

    function insert(matrix,element){
        var totalPos = [];
        totalPos.push.apply(totalPos,getPositions(matrix,element,'row'));
        totalPos.push.apply(totalPos,getPositions(reverseMatrix(matrix),element,'col'));
        const pos = totalPos[Math.floor(Math.random()*totalPos.length)];
        return pos;
    }

    function getPositions(matrix,element,where){
        var rows = [];
        var positions = [];
        for(var i = 0; i<matrix.length; i++){
            positions = elementFits(matrix[i],element,where);
            if(positions.length > 0){
              for(var j = 0; j<positions.length;j++){
                positions[j].index = i;
                rows.push(positions[j]);
              }
            }
        }
        return rows;
    }

    function elementFits(array,element,where){
        var positions = [];
        if(array.count('_') >= element.length){
            const fits = array.consecutiveElement('_');
            fits.forEach(function(elem){
                if(elem.len >= element.length){
                    elem.where = where;
                    positions.push(elem);
                }
            });
        }
        return positions;
    }

    function reverseMatrix(matrix){
        var matrixReverse = [];
        var column = [];
        for(var i = 0; i<matrix.length; i++){
          for(var j = 0; j<matrix.length;j++){
            column.push(matrix[j][i]);
          }
            matrixReverse.push(column);
            column = [];
        }

        return matrixReverse;
    }


   return {
        generateMatrix : function(matrix,maxLength){
            const matrixLength = maxLength + 5;
            var row = [];
            for(var i = 0; i< matrixLength; i++){
                for(var j = 0; j < matrixLength; j++){
                    row.push('_');
                }
                matrix.push(row);
                row = [];
            }
        },
        getPosition : function(matrix, element){
           return insert(matrix,element);
        }
    };

})();



const letterSoup = function(words,maxLength){
    const letters = 'abcdefghijklmnñopqrstuvwxyzáéíóúü';
    var soup = [];

    matrixFunctions.generateMatrix(soup,maxLength);
    words.forEach(function(word){
        addWord(word);
    });

    completeLetterSoup();

    function addWord(word){
        var pos = matrixFunctions.getPosition(soup,word);
        var start = pos.start;
        if(pos.len > word.length){
            start = Math.floor(Math.random()*(pos.len - word.length))+pos.start;
        }
        if(pos.where === 'row'){
            for(var i = 0; i<word.length; i++){
                soup[pos.index][start+i] = word[i];
            }
        }else if(pos.where === 'col'){
            for(var j = 0; j<word.length; j++){
                soup[start+j][pos.index] = word[j];
            }
        }

    }

    function completeLetterSoup(){
        soup.forEach(function(row){
            for(var i = 0; i<row.length;i++){
                if(row[i] === '_'){
                   row[i] = letters[Math.floor(Math.random()*letters.length)];
                }
            }
        });
    }

    /*soup.forEach(function(row){
        console.log.apply(console,row);
    });*/
    return soup;

};



export default Ember.Route.extend({
  model(){
    return new Ember.RSVP.Promise(function(resolveWord){
      getWord(resolveWord);
    }).then(resolveWord);
  }
});
