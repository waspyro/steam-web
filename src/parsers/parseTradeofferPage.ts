export default (html: string) => {
    let start = 0;
    const [myEscrow, theirEscrow, bothEscrow] = [
        /g_daysMyEscrow = (\d*)/,
        /g_daysTheirEscrow = (\d*)/,
        /g_daysBothEscrow = (\d*)/
    ].map(re => {
        re.lastIndex = start
        const res = re.exec(html)
        //@ts-ignore
        start = res.lastIndex
        if(res) throw new Error(re + ' does not executed successfully')
        return res[1]
    }) //todo: friends since, private inventories, new guard and etc. errors
    return {myEscrow, theirEscrow, bothEscrow}
}