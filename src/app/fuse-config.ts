/**
 * Default Fuse Configuration
 *
 * You can edit these options to change the default options. All these options also can be changed per component
 * basis. See `app/main/content/pages/authentication/login/login.component.ts` constructor method to learn more
 * about changing these options per component basis.
 */
export const fuseConfig = {
    layout          : {
        navigation      : 'left', // 'right', 'left', 'top', 'none'
        navigationFolded: false, // true, false
        toolbar         : 'below', // 'above', 'below', 'none'
        footer          : 'none', // 'above', 'below', 'none'
        mode            : 'fullwidth' // 'boxed', 'fullwidth'
    },
    colorClasses    : {
        toolbar: 'white-500-bg',
        navbar : 'fuse-dark-700-bg',
        footer : 'fuse-dark-900-bg'
    },
    customScrollbars: true,
    routerAnimation : 'fadeIn' // fadeIn, slideUp, slideDown, slideRight, slideLeft, none
};
