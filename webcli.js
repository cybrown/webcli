var packageInfo = require('./package.json');
var commander = require('commander');

var commandCalled = false;

function commandWrapper(command) {
    return function () {
        commandCalled = true;
        return command.apply(this, arguments);
    };
}

commander
    .version(packageInfo.version);

commander
    .command('server')
    .alias('s')
    .description('Run development server')
    .option('-p, --port <port>', 'Port for development server')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'dev')
    .action(commandWrapper(require('./lib/commands/server')));

commander
    .command('build')
    .alias('b')
    .description('Create production files')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'prod')
    .action(commandWrapper(require('./lib/commands/build')));

commander
    .command('package')
    .alias('p')
    .description('Create production package')
    .option('-t --type [type]', 'Create an archive (zip or tgz), defaults to zip', /^(zip|tgz)$/i, 'zip')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'prod')
    .action(commandWrapper(require('./lib/commands/package')));

commander
    .command('test')
    .alias('t')
    .description('Run unit tests')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'dev')
    .action(commandWrapper(require('./lib/commands/test')));

commander
    .command('clean')
    .description('Remove build files')
    .action(commandWrapper(require('./lib/commands/clean')));

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
} else if (!commandCalled) {
    commander.outputHelp();
}
