'use strict';

function day(){
    // If day is not over, continue.
    if(daylight_passed < 5){
        // If day just started, clear previous days events and change start-day link to text.
        if(daylight_passed === 0){
            interval_value = document.getElementById('day-duration').value;
            if(isNaN(interval_value)
              || interval_value <= 0){
                interval_value = 600;
            }

            document.getElementById('day-events').innerHTML = '';
            document.getElementById('start-day').innerHTML = 'Day Progressing...';
        }

        var output = '';

        // Generate random event value.
        var event = Math.random();
        var event_result = 0;

        // No event.
        if(event < .72){
            output = '-----';

        // Food event.
        }else if(event < .78){
            // Generate food value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Food lost.
                resources['food']['amount'] -= event_result;

                if(resources['food']['amount'] < 0){
                    // Lose 2 gold per food under 0.
                    resources['gold']['amount'] += resources['food']['amount'] * 2;
                    resources['food']['amount'] = 0;
                }

                output = 'Bugs! -';

            }else{
                // Food gained.
                resources['food']['amount'] += event_result;
                output = 'Rain! +';
            }
            output += event_result + ' Food';

        // Gold event.
        }else if(event < .84){
            // Generate gold value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Lose gold, negative gold OK.
                resources['gold']['amount'] -= event_result;
                output = 'Theives! -';

            }else{
                // Gain gold.
                resources['gold']['amount'] += event_result;
                output = 'Mining! +';
            }

            output += event_result + ' Gold';

        // Stone event.
        }else if(event < .9){
            // Generate stone value for this event.
            event_result = Math.floor(Math.random() * 2) + 1;

            if(Math.random() < .5){
                // Lose stone.
                resources['stone']['amount'] -= event_result;

                if(resources['stone']['amount'] < 0){
                    // Lose 2 gold per stone under 0.
                    resources['gold']['amount'] += resources['stone']['amount'] * 2;
                    resources['gold']['stone'] = 0;
                }

                output = 'Repair! -';

            }else{
                // Gain stone.
                resources['stone']['amount'] += event_result;
                output = 'Mining! +';
            }
            output += event_result + ' Stone';

        // Population event.
        }else if(event < .96){
            if(Math.random() < .5){
                // Lose person.
                if(resources['people']['amount'] > 0){
                    resources['people']['amount'] -= 1;
                    delete_people(0);
                }
                output = 'Sickness! -';

            }else{
                // Gain person.
                resources['people']['amount'] += 1;
                resources['people']['unemployed'] += 1;
                output = 'Recruitment! +';
            }

            // Update food bonus based on current population.
            resources['food']['bonus'] = resources['food']['workers'] * 2 - resources['people']['amount'];

            output += '1 Population';

        // Other events, not yet implemented.
        }else if(event < .99){
            event_result = Math.floor(Math.random() * 2);
            if(event_result === 0){
                output = 'Battle Event (NYI)';

            }else{
                output = 'Other Event (NYI)';
            }

        // Daily resource bonus event.
        }else{
            // Generate which resource will have daily bonus increased.
            event_result = Math.floor(Math.random() * 4);

            // Food daily bonus increase.
            if(event_result === 0){
                output = 'Seeds! +1 Food/day';
                resources['food']['bonus'] += 1;
                document.getElementById('food-bonus').innerHTML = resources['food']['bonus'];

            // Gold daily bonus increase.
            }else if(event_result === 1){
                output = 'Veins! +1 Gold/day';
                resources['gold']['bonus'] += 1;
                document.getElementById('gold-bonus').innerHTML = resources['gold']['bonus'];

            // Population daily bonus increase.
            }else if(event_result === 2){
                output = 'Popularity! +1 Population/day';
                resources['people']['bonus'] += 1;
                document.getElementById('people-bonus').innerHTML = resources['people']['bonus'];

            // Stone daily bonus increase.
            }else{
                output = 'Rocks! +1 Stone/day';
                resources['stone']['bonus'] += 1;
                document.getElementById('stone-bonus').innerHTML = resources['stone']['bonus'];

            }
        }

        // Add event to list of day-events.
        document.getElementById('day-events').innerHTML +=
          output + '<br>';

        // More daylight has passed.
        daylight_passed += 1;

        // If day is not over, wait interval_value ms for next event,
        //   which is set by the day-duration input field.
        if(daylight_passed < 5){
            window.setTimeout(
              day,
              interval_value
            );

        // Otherwise end the current day.
        }else{
            day();
        }

    }else{
        // End day.
        block_unload = 1;
        daylight_passed = 0;

        // Update resources with daily bonuses.
        for(var resource in resources){
            resources[resource]['amount'] += resources[resource]['bonus'];
        }
        resources['people']['unemployed'] += resources['people']['bonus'];

        // Calculate if there is not enough food to feed the current population.
        if(resources['food']['amount'] + resources['food']['bonus'] < 0){
            // If not enough food, decrease population and workers.
            delete_people(resources['people']['amount'] - 1);
            resources['people']['amount'] -=
              resources['people']['amount']
              - (resources['food']['amount'] + resources['food']['bonus']);

            if(resources['people']['amount'] < 0){
                resources['people']['amount'] = 0;
            }

            resources['food']['amount'] = 0;
            resources['food']['bonus'] = 0;
        }

        // Update start-day text with start new day or game over message.
        document.getElementById('start-day').innerHTML = resources['people']['amount'] > 0
          ? '<a onclick=day()>Start New Day</a>'
          : 'Your Castle Has Fallen. :(<br><a onclick=new_game()>Start Over</a>';
    }

    // Update text displays.
    for(var resource in resources){
        document.getElementById(resource).innerHTML = resources[resource]['amount'];
    }
    document.getElementById('food-bonus').innerHTML = (resources['food']['bonus'] >= 0 ? '+' : '') + resources['food']['bonus'];
    document.getElementById('unemployed-workers').innerHTML = resources['people']['unemployed'];
}

function delete_people(count){
    do{
        // Decrease unemployed workers first.
        if(resources['people']['unemployed'] > 0){
            resources['people']['unemployed'] -= 1;

        // If no unemployed workers, decrease people workers.
        }else if(resources['people']['workers'] > 0){
            resources['people']['bonus'] -= 1;
            resources['people']['workers'] -= 1;

            document.getElementById('people-bonus').innerHTML = resources['people']['workers'];
            document.getElementById('people-workers').innerHTML = resources['people']['workers'];

        // If no people workers, decrease stone workers.
        }else if(resources['stone']['workers'] > 0){
            resources['stone']['bonus'] -= 1;
            resources['stone']['workers'] -= 1;

            document.getElementById('stone-bonus').innerHTML = resources['stone']['workers'];
            document.getElementById('stone-workers').innerHTML = resources['stone']['workers'];

        // If no stone workers, decrease gold workers.
        }else if(resources['gold']['workers'] > 0){
            resources['gold']['bonus'] -= 1;
            resources['gold']['workers'] -= 1;

            document.getElementById('gold-bonus').innerHTML = resources['gold']['workers'];
            document.getElementById('gold-workers').innerHTML = resources['gold']['workers'];

        // If no gold workers, decrease food workers.
        }else{
            resources['food']['workers'] -= 1;
            document.getElementById('food-workers').innerHTML = resources['food']['workers'];
        }
    }while(count--);
}

function distribute_workers(resource, amount){
    // Positive amount = decrease workers.
    // Negative amount = increase workers.

    // Return if a day is in progress
    //   or there are no unemployed workers and workers are being increased.
    if(daylight_passed > 0
      || (resources['people']['unemployed'] <= 0 && amount > 0)){
        return;
    }

    // Alter food workers...
    if(resource === 0){
        if(resources['food']['workers'] > 0
          || amount > 0){
            resources['people']['unemployed'] -= amount;
            resources['food']['bonus'] += amount * 2;
            resources['food']['workers'] += amount;

        }else{
            resources['food']['workers'] = 0;
        }

        document.getElementById('food-bonus').innerHTML =
          (resources['food']['bonus'] >= 0 ? '+' : '') + resources['food']['bonus'];
        document.getElementById('food-workers').innerHTML = resources['food']['workers'];

    // ..or alter gold workers...
    }else if(resource === 1){
        if(resources['gold']['workers'] > 0
          || amount > 0){
            resources['people']['unemployed'] -= amount;
            resources['gold']['bonus'] += amount;
            resources['gold']['workers'] += amount;

        }else{
            resources['gold']['workers'] = 0;
        }

        document.getElementById('gold-bonus').innerHTML = resources['gold']['bonus'];
        document.getElementById('gold-workers').innerHTML = resources['gold']['workers'];

    // ...or alter people workers...
    }else if(resource === 2){
        if(resources['people']['workers'] > 0
          || amount > 0){
            resources['people']['unemployed'] -= amount;
            resources['people']['bonus'] += amount;
            resources['people']['workers'] += amount;

        }else{
            resources['people']['workers'] = 0;
        }

        document.getElementById('people-bonus').innerHTML = resources['people']['bonus'];
        document.getElementById('people-workers').innerHTML = resources['people']['workers'];

    // ...or alter stone workers.
    }else{
        if(resources['stone']['workers'] > 0
          || amount > 0){
            resources['people']['unemployed'] -= amount;
            resources['stone']['bonus'] += amount;
            resources['stone']['workers'] += amount;

        }else{
            resources['stone']['workers'] = 0;
        }

        document.getElementById('stone-bonus').innerHTML = resources['stone']['bonus'];
        document.getElementById('stone-workers').innerHTML = resources['stone']['workers'];
    }

    document.getElementById('unemployed-workers').innerHTML = resources['people']['unemployed'];
}

function new_game(){
    block_unload = 0;
    daylight_passed = 0;

    for(var resource in resource_defaults){
        resources[resource] = resources[resource] || {};

        resources[resource]['amount'] = resource_defaults[resource]['amount'];
        resources[resource]['bonus'] = resource_defaults[resource]['bonus'];
        resources[resource]['workers'] = resource_defaults[resource]['workers'];

        document.getElementById(resource).innerHTML = resources[resource]['amount'];
        document.getElementById(resource + '-bonus').innerHTML = resources[resource]['bonus'];
        document.getElementById(resource + '-workers').innerHTML = resources[resource]['workers'];
    }

    resources['people']['unemployed'] = resource_defaults['people']['unemployed'];
    document.getElementById('unemployed-workers').innerHTML = resource_defaults['people']['unemployed'];

    document.getElementById('day-events').innerHTML = '';
    document.getElementById('start-day').innerHTML = '<a onclick=day()>Start New Day</a>';
}

var block_unload = 0;
var daylight_passed = 0;
var interval_value = 0;
var resource_defaults = {
  'food': {
    'amount': 10,
    'bonus': -1,
    'workers': 0,
  },
  'gold': {
    'amount': 0,
    'bonus': 0,
    'workers': 0,
  },
  'people': {
    'amount': 1,
    'bonus': 0,
    'unemployed': 1,
    'workers': 0,
  },
  'stone': {
    'amount': 0,
    'bonus': 0,
    'workers': 0,
  },
};
var resources = {};

window.onbeforeunload = function(){
    // Warn players if they have already made progress.
    if(block_unload
      && resources['people']['amount'] > 0){
        return 'Save feature will be implemented in the future.';
    }
};

window.onkeydown = function(e){
    var key = e.keyCode || e.which;

    // If new day can be started, any key except for integer keys will start it.
    if(daylight_passed === 0
      && resources['people']['amount'] > 0
      && (key < 48 || key > 57)){
        day();
    }
};

window.onload = new_game;
