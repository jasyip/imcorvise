if (!process.env.npm_config_nocopy)
{
    const { write: copy } = require('clipboardy');
    const chalk = require('chalk');
    const boxen = require('boxen');

    const port = process.env.npm_config_port || 1234;
    const params = process.env.npm_config_params;

    let url = `http://localhost:${port}`;
    if (params)
    {
        url += `/profile/${encodeURIComponent(params)}`;
    }

    (async () =>
    {
        let message = chalk.yellow.inverse('Your URL');

        message += `\n\n${chalk.bold(`${url}`)}`;

        try
        {
            await copy(url);
            message += `\n\n${chalk.grey('Copied local address to clipboard!')}`;
        }
        catch (err)
        {
            message = chalk.red.bold(`Cannot copy ${url} to clipboard 🥺\n\n${err.message}`);
        }

        console.log(
            boxen(message, {
                borderStyle: 'round',
                padding: 1,
                borderColor: 'yellow',
                margin: 1
            })
        );
    })();
}
