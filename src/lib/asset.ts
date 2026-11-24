/**
 * Path to a file in /public that works wherever the site is hosted: at the domain root locally,
 * or in a sub-folder on GitHub Pages (osmooo.github.io/ingo-website/). Pass the path without a leading slash.
 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
