const Mongoose = require('mongoose');
const { includes, get, isEmpty } = require('lodash');
const { parse } = require('node-html-parser');
const { decode } = require('html-entities');

/* Create AWS s3 bucket url */
const S3_URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * This method is responsible for create slug
 * @param {*} string raw string
 * @return {*} string slug
 */
const getSlug = (string) => {
  return string
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
};

/**
 * This method is check and email is valid or not
 *
 * @param {*} email email id
 * @returns true/false
 */
const isValidEmail = (email) => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailRegex.test(String(email))) {
    return true;
  }
  return false;
};

/**
 * This method is responsible to check file type
 * @param {*} file file
 * @param {*} exceptType exceptType
 * @return {*} string slug
 */
const isValidFile = async (
  file,
  exceptType = ['jpeg', 'jpg', 'png', 'svg'],
) => {
  const name = file.hapi.filename;
  const extension = name.split('.').pop().toLowerCase();
  if (exceptType.includes(extension)) {
    global.logger().info('Valid file!');
    return true;
  }
  global.logger().info('Invalid file!');
  return false;
};

/**
 * This function is responsible for compare a value and sort
 * @param {*} item1 first item
 * @param {*} item2 second item
 * @return {*} return true false
 */
const compare = (item1, item2, action, key) => {
  if (action === 'asc') {
    if (item1[key] < item2[key]) {
      return 1;
    }
    if (item1[key] > item2[key]) {
      return -1;
    }
  } else {
    if (item1[key] < item2[key]) {
      return -1;
    }
    if (item1[key] > item2[key]) {
      return 1;
    }
  }
  return 0;
};

/**
 * This method is return true if number is in string formate
 * @param {*} str string
 * @returns {Boolean} true/false
 */
const isNumeric = (str) => {
  if (typeof str !== 'string') return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

/**
 * This method is convert numeric string in number
 * @param {*} str string
 * @returns {Number} converted string
 */
const strToNumber = (str) => {
  if (module.exports.isNumeric(str)) {
    return parseInt(str);
  }
  return str;
};

/**
 * Parse string to mongo id
 * @param {*} id string
 * @returns {ObjectId} mongodb object
 */
const parseInMongoObjectId = (id) => {
  return Mongoose.Types.ObjectId(id);
};

/**
 * This function is used to extract the userId's from @mention's from anchor tags.
 * @mention's are used in post and comments from frontend and added as an anchor tag in DB.
 * We are extracting the href from html string and then returning the array of userId's
 *
 * @param {String} htmlString
 * @returns {Array} user ids
 */
const parseUserIdsFromHtmlString = (htmlString) => {
  const anchors = parse(htmlString).querySelectorAll('a');
  const userIds = [];
  anchors.forEach((e) => {
    const link = e.getAttribute('href').split('/');
    if (link[1] === 'userProfile') {
      userIds.push(link[2]);
    }
  });
  return userIds;
};

/**
 * Remove anchor tag from html string
 *
 * @param {String} htmlString
 * @returns {Array} newHtmlString
 */
const removeAnchorTags = (htmlString) => {
  return htmlString.replace(/<a[^>]*>|<\/a>/g, '');
};

/**
 * This function is responsible for check user email setting
 * @param {*} userData user DB data
 * @param {*} key setting path
 * @returns {Boolean} true/false
 */
const isUserAllowEmail = (userData, key, followerIdList = []) => {
  const setting = get(
    userData,
    `userMeta.notificationSettings.email.${key}`,
    'Off',
  );
  switch (setting) {
    case 'Off': {
      return false;
    }
    case 'From people I follow': {
      if (includes(followerIdList, userData._id)) {
        return true;
      }
      return false;
    }
    case 'From everyone': {
      return true;
    }
    default: {
      return true;
    }
  }
};

/**
 * Get AWS full path for media
 * @param {*} key media name
 * @param {*} useFor user for
 * @returns {*} AWS image urls
 */
const makeS3MediaUrl = (key, type) => {
  switch (type) {
    case 'userAvatar': {
      if (key) {
        return `${S3_URL}/${key}`;
      }
      return `${S3_URL}/assets/jpg/avatar.jpg`;
    }
    case 'groupAvatar': {
      if (key && key.includes('/assets/png/default-avatar.png')) {
        return `${S3_URL}${key}`;
      } else if (key) {
        return `${S3_URL}/${key}`;
      }
      return `${S3_URL}/assets/png/default-avatar.png`;
    }
    case 'challengeImage': {
      if (key) {
        return `${S3_URL}/${key}`;
      }
      return `${S3_URL}/assets/png/default-challenge-img.png`;
    }
    default: {
      if (key) {
        return `${S3_URL}${key}`;
      }
      return `${S3_URL}/seo/video-palceholder.png`;
    }
  }
};

/**
 * Get submission image on the basis of media category
 * @param {*} submission submission object
 * @returns {*} image url
 */
const getMediaThumbnail = (media, useFor) => {
  if (!media) {
    return makeS3MediaUrl('', useFor);
  }

  switch (media.type) {
    case 'link': {
      if (
        media.linkType === 'youtube' ||
        media.linkType === 'twitchClips' ||
        media.linkType === 'twitchVideo'
      ) {
        return media.thumbnail;
      } else {
        return `${S3_URL}/seo/video-palceholder.png`;
      }
    }
    case 'video': {
      return `${process.env.MUX_IMAGE_URL}${media.originalLink}/thumbnail.png`;
    }
    case 'image': {
      return `${S3_URL}/${media.originalLink}`;
    }
    default: {
      return makeS3MediaUrl('', useFor);
    }
  }
};

/**
 * This function is responsible for return user badges url
 * @param {Array} badges badges
 * @returns {Array} badge url
 */
const getUserBadgesUrls = (badges) => {
  const badgeUrls = [];
  if (includes(badges, 'staff_member')) {
    badgeUrls.push({ url: `${S3_URL}/email-template/staff_badge.png` });
  } else if (includes(badges, 'verified_creator')) {
    badgeUrls.push({ url: `${S3_URL}/email-template/influencer_badge.png` });
  }
  if (includes(badges, 'founding_member')) {
    badgeUrls.push({ url: `${S3_URL}/email-template/founder_badge.png` });
  }
  return badgeUrls;
};

/**
 * This function is responsible for return community badges url
 * @param {Array} badges badges
 * @returns {Array} badge url
 */
const getCommunityBadgesUrls = (badges) => {
  const badgeUrls = [];
  if (includes(badges, 'verified')) {
    badgeUrls.push({
      url: `${S3_URL}/email-template/community_verified.png`,
    });
  }
  return badgeUrls;
};

/**
 * This function is responsible for return reward currency symbol
 * @param {String} currency currency
 * @returns {String} symbol
 */
const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'GBP': {
      return '£';
    }
    case 'USD': {
      return '$';
    }
    case 'EUR': {
      return '€';
    }
    case 'JPY': {
      return '¥';
    }
    default: {
      return '';
    }
  }
};
/**
 * This function is responsible for return reward object
 * @param {Object Array} rewards rewards
 * @returns {Object} reward
 */
const getRewardIconUrl = (reward) => {
  let url = '';
  if (!reward) {
    return url;
  }
  if (reward.type === 'cash') {
    switch (reward.currency) {
      case 'GBP': {
        url = `${S3_URL}/assets/png/GBP.png`;
        break;
      }
      case 'USD': {
        url = `${S3_URL}/assets/png/USD.png`;
        break;
      }
      case 'EUR': {
        url = `${S3_URL}/assets/png/EUR.png`;
        break;
      }
      case 'JPY': {
        url = `${S3_URL}/assets/png/JPY.png`;
        break;
      }
      default: {
        return '';
      }
    }
  } else if (reward.type === 'recognition') {
    const media = get(reward, 'image', false);
    if (media && !isEmpty(media)) {
      url = getMediaThumbnail(media, 'recognition');
    } else {
      url = `${S3_URL}/assets/png/recognition.png`;
    }
  } else if (reward.type === 'digital') {
    const media = get(reward, 'image', false);
    if (media && !isEmpty(media)) {
      url = getMediaThumbnail(media, 'digital');
    } else {
      url = `${S3_URL}/assets/png/digital.png`;
    }
  } else if (reward.type === 'physical') {
    const media = get(reward, 'image', false);
    if (media && !isEmpty(media)) {
      url = getMediaThumbnail(media, 'physical');
    } else {
      url = `${S3_URL}/assets/png/physical.png`;
    }
  } else {
    url = `${S3_URL}/assets/png/default-reward-icon-groups.png`;
  }
  return url;
};

/**
 * This method is responsible for create webapp page url
 * @param {String} url tail
 * @returns {String} complete webapp url
 */
const makeWebappPageUrl = (urlTail) => {
  return `${process.env.WEBAPP_BASE_URL}/${urlTail}`;
};

/**
 * This will return the mostly used creator user object needed as per mongoose schema from user object
 * @param {object} user
 */
const formatCreatorDetails = (user) => {
  return {
    userId: get(user, '_id'),
    username: get(user, 'profile.username', ''),
    avatar: get(user, 'profile.avatar', ''),
    email: get(user, 'email'),
    badges: get(user, 'profile.badges', []),
  };
};

/**
 * Create group object form group data
 * @param {Object} group
 * @return {Object} group {id, name, avatar, and badges}
 */
const formateGroupData = (group) => {
  return {
    id: get(group, '_id', ''),
    name: get(group, 'name', ''),
    avatar: get(group, 'profileImage.originalLink', ''),
    badges: get(group, 'badges', []),
  };
};

/**
 * Remove html code and tag
 * @param {HTMLElement} html element
 * @return {String} converted string
 */
const removeHtmlCodeAndElement = (html) => {
  let str = html.replace(/(<([^>]+)>)/gi, '');
  str = decode(str, { level: 'html5' });
  return str;
};

/**
 * Return Group Status
 * @param {String} status challenge status
 * @return {Number} challenge status number
 */
const returnOrderStatus = (status) => {
  if (status === 'live') {
    return 1;
  } else if (status === 'voting') {
    return 2;
  } else if (status === 'review') {
    return 3;
  } else if (status === 'published') {
    return 4;
  } else if (status === 'complete') {
    return 5;
  } else {
    return 0;
  }
};

/**
 * This method is responsible to truncate string using max length
 *
 * @param {*} str original string
 * @param {*} maxLength string maximum length
 * @returns {*} str new string
 */
const truncateString = (str, maxLength) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...';
  } else {
    return str;
  }
};

module.exports = {
  getSlug,
  isValidEmail,
  isValidFile,
  compare,
  isNumeric,
  strToNumber,
  parseInMongoObjectId,
  parseUserIdsFromHtmlString,
  removeAnchorTags,
  isUserAllowEmail,
  makeS3MediaUrl,
  getMediaThumbnail,
  getUserBadgesUrls,
  getCommunityBadgesUrls,
  getCurrencySymbol,
  getRewardIconUrl,
  makeWebappPageUrl,
  formateGroupData,
  formatCreatorDetails,
  removeHtmlCodeAndElement,
  returnOrderStatus,
  truncateString,
};
