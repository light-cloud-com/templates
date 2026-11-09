using CrudApi.Models;

namespace CrudApi.Tests;

public class PageRequestTests
{
    [Fact]
    public void DefaultsTo20From0()
    {
        Assert.True(PageRequest.TryParse(null, null, out var page));
        Assert.Equal(new PageRequest(20, 0), page);
    }

    [Theory]
    [InlineData("1", "0")]
    [InlineData("100", "5000")]
    public void AcceptsValuesInRange(string limit, string offset) =>
        Assert.True(PageRequest.TryParse(limit, offset, out _));

    [Theory]
    [InlineData("0", null)]
    [InlineData("101", null)]
    [InlineData("abc", null)]
    [InlineData(null, "-1")]
    [InlineData(null, "1.5")]
    public void RejectsValuesOutOfRange(string? limit, string? offset) =>
        Assert.False(PageRequest.TryParse(limit, offset, out _));
}
