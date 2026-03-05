const getDateFilter = (day,month,year) => {
    const filterDay = day || 1;
    const filterMonth = month || new Date().getMonth();
    const filterYear = year || new Date().getFullYear();
    
    return new Date(filterYear, filterMonth, filterDay)
}

module.exports = {getDateFilter}