import { routes } from '@stricjs/app';
import { text, json } from '@stricjs/app/send';
import { prisma, renderTemplate, type TemplateData } from '../../function';
import { getQueryParams } from '../../function';
import { getAllTemplateData } from '../templateData';

export default routes()
  .get('/templateData/:key', async ctx => {
    let templateData: TemplateData = {};
    const queryParams = getQueryParams(ctx.req.url);

    if (!ctx.params.key) {
      // Fetch all template data if no specific key is provided
      const KVDB = await getAllTemplateData();
      KVDB.forEach(element => {
        templateData[element.key] = element.value || 'undefined';
      });
    } else {
      // Fetch specific template data by key
      const element = await prisma.keyValue.findFirst({ where: { key: { equals: ctx.params.key } } });
      if (!element) {
        return text("TemplateData not found");
      }
      templateData[element.key] = element.value || 'undefined';
    }

    // Handle response type based on query parameter
    if (queryParams.type) {
      switch (queryParams.type) {
        case 'json':
          return json(templateData);
        default:
          return text("Unsupported type");
      }
    } else {
      return text("No type specified");
    }
  })
  .get('/:file', async ctx => {
    try {
      const fileContent = await Bun.file("files/" + ctx.params["file"]).text();
      const renderedContent = await renderTemplate(fileContent);
      return text(renderedContent);
    } catch (error) {
      return text("Error reading or rendering file");
    }
  });