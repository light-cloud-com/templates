using System.Text.Json;
using CrudApi.Models;

namespace CrudApi.Tests;

public class ItemInputTests
{
    private static (ItemInput? Input, string? Error) Parse(string json) =>
        ItemInput.Parse(JsonDocument.Parse(json).RootElement);

    [Fact]
    public void TrimsNameAndKeepsDescription()
    {
        var (input, error) = Parse("""{"name": "  Box  ", "description": "Hello"}""");
        Assert.Null(error);
        Assert.Equal(new ItemInput("Box", "Hello"), input);
    }

    [Fact]
    public void DescriptionIsOptional()
    {
        Assert.Equal(new ItemInput("Box", null), Parse("""{"name": "Box"}""").Input);
        Assert.Equal(new ItemInput("Box", null), Parse("""{"name": "Box", "description": null}""").Input);
    }

    [Theory]
    [InlineData("""{"name": ""}""")]
    [InlineData("""{"name": "   "}""")]
    [InlineData("""{"name": 123}""")]
    [InlineData("""{}""")]
    public void RejectsMissingOrNonStringName(string json) =>
        Assert.Equal("name is required and must be 1 to 200 characters", Parse(json).Error);

    [Fact]
    public void RejectsNameLongerThan200() =>
        Assert.NotNull(Parse($$"""{"name": "{{new string('x', 201)}}"}""").Error);

    [Fact]
    public void RejectsNonStringDescription() =>
        Assert.Equal("description must be a string", Parse("""{"name": "x", "description": 5}""").Error);

    [Fact]
    public void RejectsBodyThatIsNotAnObject() =>
        Assert.Equal("Send a JSON object", Parse("""["x"]""").Error);
}
