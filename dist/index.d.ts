interface DataObject {
    [key: string]: any;
}
declare function renderTemplate(htmlString: string, data: DataObject, removeJsAttributes?: boolean): string;
export { renderTemplate };
